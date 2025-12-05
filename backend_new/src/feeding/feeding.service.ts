// feeding/services/feeding.service.ts (UPDATED)
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { FeedingSchedule } from '../database/entities/FeedingSchedule.entity';
import { Batch } from '../database/entities/Batch.entity';
import { CreateFeedingRecordDto } from './dto/feeding.dto';
import { FeedingRecommendationsService } from './feeding-recommendations.service';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class FeedingService {
  constructor(
    @InjectRepository(FeedingRecord)
    private feedingRecordRepository: Repository<FeedingRecord>,
    @InjectRepository(FeedingSchedule)
    private feedingScheduleRepository: Repository<FeedingSchedule>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private recommendationsService: FeedingRecommendationsService,
    private logger: CustomLogger,
  ) {}

  async getBatchRecommendations(batchId: string, userId: string) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: ['bird_type', 'flock'],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (!batch.bird_type_id) {
      return {
        current_recommendation: null,
        all_recommendations: [],
        batch_age: this.calculateBatchAge(batch),
        message: 'No bird type assigned to batch',
      };
    }

    // Calculate batch age
    const batchAge = this.calculateBatchAge(batch);

    // Get current recommendation for age
    const currentRecommendation =
      await this.recommendationsService.getRecommendationForAge(
        batch.bird_type_id,
        batchAge,
      );

    // Get all recommendations for bird type
    const allRecommendations =
      await this.recommendationsService.getRecommendationsByBirdType(
        batch.bird_type_id,
      );

    // Calculate daily feed requirement for batch
    let dailyFeedRequired = 0;
    if (currentRecommendation) {
      dailyFeedRequired =
        currentRecommendation.quantity_per_bird_per_day * batch.current_count;
    }

    return {
      current_recommendation: currentRecommendation
        ? {
            ...currentRecommendation,
            daily_feed_required_kg: parseFloat(dailyFeedRequired.toFixed(2)),
            cost_estimate:
              currentRecommendation.quantity_per_bird_per_day *
              batch.current_count *
              45, // Assuming average cost
          }
        : null,
      all_recommendations: allRecommendations,
      batch_info: {
        id: batch.id,
        age_days: batchAge,
        current_count: batch.current_count,
        bird_type: batch.bird_type?.name,
      },
    };
  }

  async recordFeeding(
    batchId: string,
    userId: string,
    createDto: CreateFeedingRecordDto,
  ): Promise<FeedingRecord> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const record = this.feedingRecordRepository.create({
      batch_id: batchId,
      schedule_id: createDto.schedule_id,
      age: createDto.age,
      feed_type: createDto.feed_type,
      quantity: createDto.quantity,
      cost: createDto.cost,
      supplier: createDto.supplier,
      fed_at: createDto.fed_at || new Date(),
      recorded_by: userId,
      notes: createDto.notes,
    });

    await this.feedingRecordRepository.save(record);

    this.logger.log(
      `Feeding recorded: ${createDto.quantity}kg of ${createDto.feed_type} for batch ${batchId}`,
    );

    return record;
  }

  async getFeedingRecords(batchId: string, userId: string, query: any) {
    console.log('Query:', query, userId, batchId);
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch || batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const { start_date, end_date, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.feedingRecordRepository
      .createQueryBuilder('record')
      .where('record.batch_id = :batchId', { batchId })
      .skip(skip)
      .take(limit)
      .orderBy('record.fed_at', 'DESC');

    if (start_date) {
      queryBuilder.andWhere('record.fed_at >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('record.fed_at <= :end_date', { end_date });
    }

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFeedingAnalytics(
    batchId: string,
    userId: string,
    period: string = '7days',
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch || batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const records = await this.feedingRecordRepository.find({
      where: {
        batch_id: batchId,
        fed_at: Between(startDate, endDate),
      },
      order: { fed_at: 'ASC' },
    });

    // Calculate totals
    const totalQuantity = records.reduce(
      (sum, r) => sum + parseFloat(r.quantity.toString()),
      0,
    );
    const totalCost = records.reduce(
      (sum, r) => sum + parseFloat((r.cost || 0).toString()),
      0,
    );
    const averagePerDay =
      records.length > 0 ? totalQuantity / records.length : 0;

    // Feed type breakdown
    const byFeedType = records.reduce(
      (acc, record) => {
        const type = record.feed_type;
        if (!acc[type]) {
          acc[type] = { quantity: 0, cost: 0, count: 0 };
        }
        acc[type].quantity += parseFloat(record.quantity.toString());
        acc[type].cost += parseFloat((record.cost || 0).toString());
        acc[type].count += 1;
        return acc;
      },
      {} as Record<string, { quantity: number; cost: number; count: number }>,
    );

    // Daily breakdown
    const dailyBreakdown = records.reduce(
      (acc, record) => {
        const date = new Date(record.fed_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { quantity: 0, cost: 0, records: 0 };
        }
        acc[date].quantity += parseFloat(record.quantity.toString());
        acc[date].cost += parseFloat((record.cost || 0).toString());
        acc[date].records += 1;
        return acc;
      },
      {} as Record<string, { quantity: number; cost: number; records: number }>,
    );

    return {
      period,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      totals: {
        total_quantity_kg: parseFloat(totalQuantity.toFixed(2)),
        total_cost: parseFloat(totalCost.toFixed(2)),
        total_records: records.length,
        average_per_day_kg: parseFloat(averagePerDay.toFixed(2)),
        average_per_bird_per_day_kg:
          batch.current_count > 0
            ? parseFloat(
                (totalQuantity / records.length / batch.current_count).toFixed(
                  3,
                ),
              )
            : 0,
      },
      by_feed_type: byFeedType,
      daily_breakdown: dailyBreakdown,
    };
  }

  private calculateBatchAge(batch: Batch): number {
    const startDate = new Date(batch.start_date || batch.hatch_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
