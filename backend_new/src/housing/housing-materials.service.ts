// housing/services/housing-materials.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HousingMaterial } from '../database/entities/HousingMaterial.entity';
import { HousingQuantity } from '../database/entities/HousingQuantity.entity';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateQuantityDto,
  UpdateQuantityDto,
  QueryMaterialsDto,
} from './dto/housing.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class HousingMaterialsService {
  constructor(
    @InjectRepository(HousingMaterial)
    private materialRepository: Repository<HousingMaterial>,
    @InjectRepository(HousingQuantity)
    private quantityRepository: Repository<HousingQuantity>,
    private logger: CustomLogger,
  ) {}

  // Materials Management

  async createMaterial(createDto: CreateMaterialDto): Promise<HousingMaterial> {
    const material = this.materialRepository.create(createDto);
    await this.materialRepository.save(material);

    this.logger.log(`Housing material created: ${material.name}`);

    return material;
  }

  async getMaterials(query: QueryMaterialsDto) {
    const { search, category, active_only, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.materialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.quantities', 'quantities')
      .skip(skip)
      .take(limit)
      .orderBy('material.display_order', 'ASC')
      .addOrderBy('material.name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        '(material.name ILIKE :search OR material.description ILIKE :search OR material.specifications ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('material.category = :category', { category });
    }

    if (active_only) {
      queryBuilder.andWhere('material.is_active = true');
    }

    const [materials, total] = await queryBuilder.getManyAndCount();

    return {
      materials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMaterial(id: string): Promise<HousingMaterial> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['quantities'],
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async updateMaterial(
    id: string,
    updateDto: UpdateMaterialDto,
  ): Promise<HousingMaterial> {
    const material = await this.materialRepository.findOne({ where: { id } });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.is_system_default && updateDto.is_active === false) {
      throw new BadRequestException(
        'Cannot deactivate system default materials',
      );
    }

    Object.assign(material, updateDto);
    await this.materialRepository.save(material);

    this.logger.log(`Housing material updated: ${material.name}`);

    return this.getMaterial(id);
  }

  async deleteMaterial(id: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['quantities'],
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.is_system_default) {
      throw new BadRequestException('Cannot delete system default materials');
    }

    await this.materialRepository.remove(material);

    this.logger.log(`Housing material deleted: ${material.name}`);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.materialRepository
      .createQueryBuilder('material')
      .select('DISTINCT material.category', 'category')
      .where('material.category IS NOT NULL')
      .orderBy('material.category', 'ASC')
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  // Quantities Management

  async createQuantity(createDto: CreateQuantityDto): Promise<HousingQuantity> {
    // Verify material exists
    const material = await this.getMaterial(createDto.material_id);

    // Check if quantity already exists for this capacity
    const existing = await this.quantityRepository.findOne({
      where: {
        material_id: createDto.material_id,
        bird_capacity: createDto.bird_capacity,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Quantity already exists for ${createDto.bird_capacity} bird capacity`,
      );
    }

    const quantity = this.quantityRepository.create(createDto);
    await this.quantityRepository.save(quantity);

    this.logger.log(
      `Quantity added: ${createDto.quantity_needed} ${material.unit} for ${createDto.bird_capacity} birds`,
    );

    return quantity;
  }

  async getQuantitiesByMaterial(
    materialId: string,
  ): Promise<HousingQuantity[]> {
    return this.quantityRepository.find({
      where: { material_id: materialId },
      order: { bird_capacity: 'ASC' },
    });
  }

  async getQuantitiesByCapacity(
    birdCapacity: number,
  ): Promise<HousingQuantity[]> {
    return this.quantityRepository.find({
      where: { bird_capacity: birdCapacity, is_active: true },
      relations: ['material'],
      order: { material: { display_order: 'ASC' } },
    });
  }

  async updateQuantity(
    id: string,
    updateDto: UpdateQuantityDto,
  ): Promise<HousingQuantity> {
    const quantity = await this.quantityRepository.findOne({ where: { id } });

    if (!quantity) {
      throw new NotFoundException('Quantity not found');
    }

    Object.assign(quantity, updateDto);
    await this.quantityRepository.save(quantity);

    this.logger.log(`Quantity updated: ${quantity.id}`);

    return quantity;
  }

  async deleteQuantity(id: string): Promise<void> {
    const quantity = await this.quantityRepository.findOne({ where: { id } });

    if (!quantity) {
      throw new NotFoundException('Quantity not found');
    }

    await this.quantityRepository.remove(quantity);

    this.logger.log(`Quantity deleted: ${id}`);
  }

  async getAvailableCapacities(): Promise<number[]> {
    const result = await this.quantityRepository
      .createQueryBuilder('quantity')
      .select('DISTINCT quantity.bird_capacity', 'capacity')
      .orderBy('quantity.bird_capacity', 'ASC')
      .getRawMany();

    return result.map((r) => r.capacity);
  }

  // Seed default data
  async seedDefaultMaterials(): Promise<void> {
    const defaultData = this.getDefaultMaterialsData();

    for (const item of defaultData) {
      try {
        // Check if material exists
        const existing = await this.materialRepository.findOne({
          where: { name: item.name },
        });

        if (!existing) {
          const material = this.materialRepository.create({
            ...item.material,
            is_system_default: true,
          });
          await this.materialRepository.save(material);

          // Add quantities
          for (const qtyData of item.quantities) {
            const quantity = this.quantityRepository.create({
              material_id: material.id,
              ...qtyData,
            });
            await this.quantityRepository.save(quantity);
          }

          this.logger.log(`Seeded: ${item.name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to seed: ${item.name}`, error);
      }
    }

    this.logger.log('Default housing materials seeded');
  }

  private getDefaultMaterialsData() {
    return [
      {
        name: 'Roofing Sheets 32 gauge 10ft',
        material: {
          name: 'Roofing Sheets 32 gauge 10ft',
          category: 'roofing',
          unit: 'pcs',
          unit_price: 740,
          specifications: '32 gauge 10ft',
          display_order: 1,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 4 },
          { bird_capacity: 300, quantity_needed: 14 },
          { bird_capacity: 500, quantity_needed: 24 },
          { bird_capacity: 1000, quantity_needed: 42 },
        ],
      },
      {
        name: 'Roofing sheets 32gauge 8ft',
        material: {
          name: 'Roofing sheets 32gauge 8ft',
          category: 'roofing',
          unit: 'pcs',
          unit_price: 640,
          specifications: '32 gauge 8ft',
          display_order: 2,
        },
        quantities: [{ bird_capacity: 1000, quantity_needed: 12 }],
      },
      {
        name: 'Wall sheets 32 gauge 10 ft',
        material: {
          name: 'Wall sheets 32 gauge 10 ft',
          category: 'walls',
          unit: 'pcs',
          unit_price: 740,
          specifications: '32 gauge 10 ft',
          display_order: 3,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 9 },
          { bird_capacity: 300, quantity_needed: 18 },
          { bird_capacity: 500, quantity_needed: 28 },
          { bird_capacity: 1000, quantity_needed: 38 },
        ],
      },
      {
        name: 'Wire mesh',
        material: {
          name: 'Wire mesh',
          category: 'walls',
          unit: 'pcs',
          unit_price: 800,
          display_order: 4,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 2 },
          { bird_capacity: 300, quantity_needed: 5 },
          { bird_capacity: 500, quantity_needed: 6 },
          { bird_capacity: 1000, quantity_needed: 10 },
        ],
      },
      {
        name: 'Chicken mesh 6ft',
        material: {
          name: 'Chicken mesh 6ft',
          category: 'walls',
          unit: 'pc',
          unit_price: 4000,
          specifications: '6ft',
          display_order: 5,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 1 },
          { bird_capacity: 300, quantity_needed: 1 },
          { bird_capacity: 500, quantity_needed: 1 },
          { bird_capacity: 1000, quantity_needed: 1 },
        ],
      },
      {
        name: 'Fito for wall',
        material: {
          name: 'Fito for wall',
          category: 'walls',
          unit: 'pcs',
          unit_price: 30,
          display_order: 6,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 50 },
          { bird_capacity: 300, quantity_needed: 80 },
          { bird_capacity: 500, quantity_needed: 160 },
          { bird_capacity: 1000, quantity_needed: 180 },
        ],
      },

      {
        name: 'Cedar Posts',
        material: {
          name: 'Cedar Posts',
          category: 'construction',
          unit: 'pcs',
          unit_price: 500,
          display_order: 7,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 7 },
          { bird_capacity: 300, quantity_needed: 14 },
          { bird_capacity: 500, quantity_needed: 18 },
          { bird_capacity: 1000, quantity_needed: 32 },
        ],
      },
      {
        name: 'Round poles for roof',
        material: {
          name: 'Round poles for roof',
          category: 'construction',
          unit: 'pcs',
          unit_price: 250,
          display_order: 8,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 11 },
          { bird_capacity: 300, quantity_needed: 14 },
          { bird_capacity: 500, quantity_needed: 30 },
          { bird_capacity: 1000, quantity_needed: 45 },
        ],
      },
      {
        name: 'King posts',
        material: {
          name: 'King posts',
          category: 'construction',
          unit: 'pcs',
          unit_price: 350,
          display_order: 9,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 2 },
          { bird_capacity: 300, quantity_needed: 4 },
          { bird_capacity: 500, quantity_needed: 6 },
          { bird_capacity: 1000, quantity_needed: 10 },
        ],
      },
      {
        name: 'Assorted nails',
        material: {
          name: 'Assorted nails',
          category: 'construction',
          unit: 'pcs',
          unit_price: 140,
          display_order: 10,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 6 },
          { bird_capacity: 300, quantity_needed: 9 },
          { bird_capacity: 500, quantity_needed: 15 },
          { bird_capacity: 1000, quantity_needed: 18 },
        ],
      },
      {
        name: 'Roofing nails',
        material: {
          name: 'Roofing nails',
          category: 'construction',
          unit: 'pcs',
          unit_price: 200,
          display_order: 11,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 4 },
          { bird_capacity: 300, quantity_needed: 5 },
          { bird_capacity: 500, quantity_needed: 12 },
          { bird_capacity: 1000, quantity_needed: 16 },
        ],
      },

      {
        name: 'Cement',
        material: {
          name: 'Cement',
          category: 'construction',
          unit: 'pcs',
          unit_price: 720,
          display_order: 13,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 4 },
          { bird_capacity: 300, quantity_needed: 7 },
          { bird_capacity: 500, quantity_needed: 10 },
          { bird_capacity: 1000, quantity_needed: 20 },
        ],
      },
      {
        name: 'Door',
        material: {
          name: 'Door',
          category: 'fixtures',
          unit: 'pc',
          unit_price: 3500,
          display_order: 12,
        },
        quantities: [
          { bird_capacity: 100, quantity_needed: 1 },
          { bird_capacity: 300, quantity_needed: 1 },
          { bird_capacity: 500, quantity_needed: 1 },
          { bird_capacity: 1000, quantity_needed: 1 },
        ],
      },
    ];
  }
}
