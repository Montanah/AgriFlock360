// housing/services/housing-quotations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { HousingQuotation } from '../database/entities/HousingQuotation.entity';
import { HousingQuantity } from '../database/entities/HousingQuantity.entity';
import { GenerateQuotationDto } from './dto/housing.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class HousingQuotationsService {
  constructor(
    @InjectRepository(HousingQuotation)
    private quotationRepository: Repository<HousingQuotation>,
    @InjectRepository(HousingQuantity)
    private quantityRepository: Repository<HousingQuantity>,
    private logger: CustomLogger,
  ) {}

  async generateQuotation(
    userId: string,
    generateDto: GenerateQuotationDto,
  ): Promise<HousingQuotation> {
    const {
      bird_capacity,
      labor_percentage = 26,
      notes,
      metadata,
    } = generateDto;

    // Find exact match or closest capacity
    const availableCapacities = await this.getAvailableCapacities();
    const closestCapacity = this.findClosestCapacity(
      bird_capacity,
      availableCapacities,
    );

    if (!closestCapacity) {
      throw new BadRequestException(
        'No housing data available for this capacity',
      );
    }

    // Get all quantities for this capacity
    const quantities = await this.quantityRepository.find({
      where: { bird_capacity: closestCapacity, is_active: true },
      relations: ['material'],
    });

    if (quantities.length === 0) {
      throw new BadRequestException(
        `No materials configured for ${closestCapacity} bird capacity`,
      );
    }

    // Calculate materials cost
    const materials = quantities
      .filter((q) => q.material.is_active)
      .map((q) => ({
        material_id: q.material.id,
        material_name: q.material.name,
        category: q.material.category || 'other',
        unit: q.material.unit,
        unit_price: parseFloat(q.material.unit_price.toString()),
        quantity: parseFloat(q.quantity_needed.toString()),
        total_cost:
          parseFloat(q.material.unit_price.toString()) *
          parseFloat(q.quantity_needed.toString()),
        specifications: q.material.specifications,
      }));

    const materialsSubtotal = materials.reduce(
      (sum, m) => sum + m.total_cost,
      0,
    );
    const laborCost = (materialsSubtotal * labor_percentage) / 100;
    const grandTotal = materialsSubtotal + laborCost;

    // Create quotation
    const quotationData: DeepPartial<HousingQuotation> = {
      user: { id: userId },
      bird_capacity: closestCapacity,
      materials,
      materials_subtotal: materialsSubtotal,
      labor_percentage,
      labor_cost: laborCost,
      grand_total: grandTotal,
      currency: 'KES',
      status: 'draft',
      notes: notes,
      metadata: metadata,
    };

    const quotation = this.quotationRepository.create(quotationData);

    await this.quotationRepository.save(quotation);

    this.logger.log(
      `Housing quotation generated: ${closestCapacity} birds capacity for user ${userId}`,
    );

    return quotation;
  }

  async getQuotation(
    quotationId: string,
    userId: string,
  ): Promise<HousingQuotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id: quotationId, user_id: userId },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async getUserQuotations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [quotations, total] = await this.quotationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      quotations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateQuotationStatus(
    quotationId: string,
    userId: string,
    status: string,
  ): Promise<HousingQuotation> {
    const quotation = await this.getQuotation(quotationId, userId);

    const validStatuses = ['draft', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    quotation.status = status;
    await this.quotationRepository.save(quotation);

    this.logger.log(`Quotation ${quotationId} status updated to ${status}`);

    return quotation;
  }

  async deleteQuotation(quotationId: string, userId: string): Promise<void> {
    const quotation = await this.getQuotation(quotationId, userId);

    await this.quotationRepository.remove(quotation);

    this.logger.log(`Quotation deleted: ${quotationId}`);
  }

  async getQuotationsByCapacity(birdCapacity: number) {
    const [quotations, total] = await this.quotationRepository.findAndCount({
      where: { bird_capacity: birdCapacity },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      quotations,
      total,
    };
  }

  // Get summary statistics
  async getQuotationSummary(userId: string) {
    const quotations = await this.quotationRepository.find({
      where: { user_id: userId },
    });

    const totalQuotations = quotations.length;
    const totalValue = quotations.reduce(
      (sum, q) => sum + parseFloat(q.grand_total.toString()),
      0,
    );

    const byStatus = {
      draft: quotations.filter((q) => q.status === 'draft').length,
      approved: quotations.filter((q) => q.status === 'approved').length,
      rejected: quotations.filter((q) => q.status === 'rejected').length,
      completed: quotations.filter((q) => q.status === 'completed').length,
    };

    const capacities = [...new Set(quotations.map((q) => q.bird_capacity))];

    return {
      total_quotations: totalQuotations,
      total_value: totalValue,
      by_status: byStatus,
      capacities_quoted: capacities,
    };
  }

  // Get cost comparison
  async getCostComparison() {
    const capacities = [100, 300, 500, 1000];
    const comparison: Array<{
      bird_capacity: number;
      materials_cost: number;
      labor_cost: number;
      total_cost: number;
      cost_per_bird: number;
    }> = [];

    for (const capacity of capacities) {
      const quantities = await this.quantityRepository.find({
        where: { bird_capacity: capacity, is_active: true },
        relations: ['material'],
      });

      if (quantities.length > 0) {
        const materialsSubtotal = quantities.reduce(
          (sum, q) =>
            sum +
            parseFloat(q.material.unit_price.toString()) *
              parseFloat(q.quantity_needed.toString()),
          0,
        );

        const laborCost = (materialsSubtotal * 26) / 100;
        const grandTotal = materialsSubtotal + laborCost;

        comparison.push({
          bird_capacity: capacity,
          materials_cost: materialsSubtotal,
          labor_cost: laborCost,
          total_cost: grandTotal,
          cost_per_bird: grandTotal / capacity,
        });
      }
    }

    return comparison;
  }

  private async getAvailableCapacities(): Promise<number[]> {
    const result = await this.quantityRepository
      .createQueryBuilder('quantity')
      .select('DISTINCT quantity.bird_capacity', 'capacity')
      .where('quantity.is_active = true')
      .orderBy('quantity.bird_capacity', 'ASC')
      .getRawMany();

    return result.map((r) => r.capacity);
  }

  private findClosestCapacity(
    target: number,
    available: number[],
  ): number | null {
    if (available.length === 0) return null;

    // If exact match exists, return it
    if (available.includes(target)) return target;

    // Find the next higher capacity
    const higher = available.filter((c) => c >= target);
    if (higher.length > 0) {
      return Math.min(...higher);
    }

    // If no higher capacity, return the highest available
    return Math.max(...available);
  }
}
