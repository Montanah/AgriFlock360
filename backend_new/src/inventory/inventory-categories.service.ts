// inventory/services/inventory-categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryCategory, } from '../database/entities/InventoryCategory.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/inventory.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class InventoryCategoriesService {
  constructor(
    @InjectRepository(InventoryCategory)
    private categoryRepository: Repository<InventoryCategory>,
    private logger: CustomLogger,
  ) {}

  async createCategory(createDto: CreateCategoryDto): Promise<InventoryCategory> {
    // Check if category already exists
    const existing = await this.categoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create(createDto);
    await this.categoryRepository.save(category);

    this.logger.log(`Inventory category created: ${category.name}`);

    return category;
  }

  async getCategories(activeOnly: boolean = false): Promise<InventoryCategory[]> {
    const query: any = {};

    if (activeOnly) {
      query.is_active = true;
    }

    return this.categoryRepository.find({
      where: query,
      order: { name: 'ASC' },
    });
  }

  async getCategory(id: string): Promise<InventoryCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<InventoryCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if new name conflicts
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateDto);
    await this.categoryRepository.save(category);

    this.logger.log(`Inventory category updated: ${category.name}`);

    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has items
    if (category.items && category.items.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category.items.length} item(s). Move or delete items first.`,
      );
    }

    await this.categoryRepository.remove(category);

    this.logger.log(`Inventory category deleted: ${category.name}`);
  }

  // Seed default categories
  async seedDefaultCategories(): Promise<void> {
    const defaultCategories = [
      {
        name: 'Feed',
        description: 'Poultry feed and supplements',
      },
      {
        name: 'Medications',
        description: 'Veterinary medicines and treatments',
      },
      {
        name: 'Vaccines',
        description: 'Vaccination supplies',
      },
      {
        name: 'Equipment',
        description: 'Farm equipment and tools',
      },
      {
        name: 'Bedding',
        description: 'Litter and bedding materials',
      },
      {
        name: 'Cleaning Supplies',
        description: 'Disinfectants and cleaning materials',
      },
      {
        name: 'Packaging',
        description: 'Egg cartons, boxes, labels',
      },
      {
        name: 'Utilities',
        description: 'Water, electricity supplies',
      },
    ];

    for (const category of defaultCategories) {
      try {
        await this.createCategory(category);
      } catch (error) {
        if (error instanceof ConflictException) {
          this.logger.warn(`Category already exists: ${category.name}`);
        } else {
          this.logger.error(`Failed to seed category: ${category.name}`, error);
        }
      }
    }

    this.logger.log('Default inventory categories seeded');
  }
}