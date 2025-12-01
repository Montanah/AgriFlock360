// batchs/batchs.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch, BatchStatus } from '../database/entities/Batch.entity';
import { BirdType } from 'src/database/entities/BirdType.entity';
import { BatchHistory } from '../database/entities/BatchHistory.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { FeedingSchedule } from '../database/entities/FeedingSchedule.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { UpdateBatchCountDto } from './dto/update-batch-count.dto';
import { QueryBatchDto } from './dto/query-batch.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(BatchHistory)
    private batchHistoryRepository: Repository<BatchHistory>,
    @InjectRepository(Vaccination)
    private vaccinationRepository: Repository<Vaccination>,
    @InjectRepository(FeedingSchedule)
    private feedingScheduleRepository: Repository<FeedingSchedule>,
    @InjectRepository(FeedingRecord)
    private feedingRecordRepository: Repository<FeedingRecord>,
    @InjectRepository(WeightSample)
    private weightSampleRepository: Repository<WeightSample>,
    @InjectRepository(BirdType)
    private birdTypeRepository: Repository<BirdType>,
    private logger: CustomLogger,
    private auditService: AuditService,
  ) {}

  async create(
    createBatchDto: CreateBatchDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const batch = this.batchRepository.create({
      ...createBatchDto,
      user_id: userId,
      current_count: createBatchDto.initial_count,
      initial_count: createBatchDto.initial_count,
    });

    await this.batchRepository.save(batch);

    // Create initial history record
    await this.createHistoryRecord(
      batch,
      0,
      batch.initial_count,
      'initial',
      batch.initial_count,
      'Initial batch creation',
      userId,
    );

    await this.auditService.log(
      userId,
      AuditAction.BATCH_CREATED,
      'batch',
      batch.id,
      ipAddress,
      userAgent,
      { batch_name: batch.batch_name, initial_count: batch.initial_count },
    );

    this.logger.log(`batch created: ${batch.batch_name} by user ${userId}`);

    return batch;
  }

  async findAll(userId: string, query: QueryBatchDto) {
    
    const { status, farm_id, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.farm', 'farm')
      .leftJoinAndSelect('batch.device', 'device')
      .where('batch.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('batch.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('batch.current_status = :status', { status });
    }

    if (farm_id) {
      queryBuilder.andWhere('batch.farm_id = :farm_id', { farm_id });
    }

    const [batchs, total] = await queryBuilder.getManyAndCount();

    return {
      batchs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(batchId: string, userId: string) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: ['farm', 'device', 'user'],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this batch');
    }

    // Get related data
    const [vaccinations, feeding_schedules, weight_samples, history] = await Promise.all([
      this.vaccinationRepository.find({
        where: { batch_id: batchId },
        order: { scheduled_date: 'DESC' },
        take: 10,
      }),
      this.feedingScheduleRepository.find({
        where: { batch_id: batchId, is_active: true },
        order: { created_at: 'DESC' },
      }),
      this.weightSampleRepository.find({
        where: { batch_id: batchId },
        order: { sample_date: 'DESC' },
        take: 10,
      }),
      this.batchHistoryRepository.find({
        where: { batch_id: batchId },
        order: { created_at: 'DESC' },
        take: 20,
      }),
    ]);

    // Calculate stats
    const stats = await this.calculateBatchStats(batchId);

    return {
      batch,
      vaccinations,
      feeding_schedules,
      weight_samples,
      history,
      stats,
    };
  }

  async update(
    batchId: string,
    updateBatchDto: UpdateBatchDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this batch');
    }

    // Track count change
    if (updateBatchDto.current_count && updateBatchDto.current_count !== batch.current_count) {
      const changeAmount = Math.abs(updateBatchDto.current_count - batch.current_count);
      const changeType = updateBatchDto.current_count > batch.current_count ? 'adjustment' : 'adjustment';

      await this.createHistoryRecord(
        batch,
        batch.current_count,
        updateBatchDto.current_count,
        changeType,
        changeAmount,
        'Manual count update',
        userId,
      );
    }

    Object.assign(batch, updateBatchDto);
    await this.batchRepository.save(batch);

    await this.auditService.log(
      userId,
      AuditAction.BATCH_UPDATED,
      'batch',
      batch.id,
      ipAddress,
      userAgent,
      { changes: updateBatchDto },
    );

    this.logger.log(`Batch updated: ${batch.batch_name}`);

    return batch;
  }

  async updateCount(
    batchId: string,
    updateCountDto: UpdateBatchCountDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(' Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this batch');
    }

    const { change_amount, change_type, reason } = updateCountDto;

    // Calculate new count (mortality, sale, transfer decrease count)
    let newCount = batch.current_count;
    if (['mortality', 'sale', 'transfer'].includes(change_type)) {
      newCount = Math.max(0, batch.current_count - change_amount);
    } else {
      newCount = batch.current_count + change_amount;
    }

    if (newCount < 0) {
      throw new BadRequestException('Count cannot be negative');
    }

    // Create history record
    await this.createHistoryRecord(
      batch,
      batch.current_count,
      newCount,
      change_type,
      change_amount,
      reason,
      userId,
    );

    // Update batch count
    batch.current_count = newCount;
    await this.batchRepository.save(batch);

    await this.auditService.log(
      userId,
      AuditAction.BATCH_COUNT_UPDATED,
      'batch',
      batch.id,
      ipAddress,
      userAgent,
      { change_type, change_amount, reason },
    );

    this.logger.log(
      `batch count updated: ${batch.batch_name} - ${change_type}: ${change_amount}`,
    );

    return {
      batch,
      previous_count: batch.current_count + change_amount,
      current_count: newCount,
      change: {
        type: change_type,
        amount: change_amount,
        reason,
      },
    };
  }

  async archive(
    batchId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to archive this batch');
    }

    batch.current_status = BatchStatus.ARCHIVED;
    batch.actual_end_date = new Date() as any;
    await this.batchRepository.save(batch);

    await this.auditService.log(
      userId,
      AuditAction.BATCH_ARCHIVED,
      'batch',
      batch.id,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Batch archived: ${batch.batch_name}`);

    return { success: true };
  }

  async complete(
    batchId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to complete this batch');
    }

    batch.current_status = BatchStatus.COMPLETED;
    batch.actual_end_date = new Date() as any;
    await this.batchRepository.save(batch);

    await this.auditService.log(
      userId,
      AuditAction.BATCH_COMPLETED,
      'batch',
      batch.id,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Batch completed: ${batch.batch_name}`);

    return { success: true };
  }

  async getStats(batchId: string, userId: string) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this batch');
    }

    return this.calculateBatchStats(batchId);
  }

  async getAllBirdTypes() {
    return this.birdTypeRepository
      .createQueryBuilder('bird_type')
      .select('bird_type.id', 'id')
      .addSelect('bird_type.name', 'name')
      .getRawMany();
  }

  private async calculateBatchStats(batchId: string) {
    const batch = await this.batchRepository.findOne({ where: { id: batchId } });

    if (!batch) return null;

    // Calculate age in days
    const startDate = new Date(batch.start_date);
    const today = new Date();
    const ageInDays = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Mortality rate
    const totalDeaths = batch.initial_count - batch.current_count;
    const mortalityRate = ((totalDeaths / batch.initial_count) * 100).toFixed(2);

    // Get weight samples
    const weightSamples = await this.weightSampleRepository.find({
      where: { batch_id: batchId },
      order: { sample_date: 'DESC' },
      take: 1,
    });

    const latestWeight = weightSamples[0]?.average_weight_grams || 0;

    // Get feeding data
    const feedingRecords = await this.feedingRecordRepository.find({
      where: { batch_id: batchId },
    });

    const totalFeedConsumed = feedingRecords.reduce(
      (sum, record) => sum + Number(record.quantity),
      0,
    );

    const totalFeedCost = feedingRecords.reduce(
      (sum, record) => sum + (Number(record.cost) || 0),
      0,
    );

    // Feed Conversion Ratio (FCR)
    const totalWeightGained = latestWeight * batch.current_count;
    const fcr = totalFeedConsumed > 0
      ? (totalFeedConsumed * 1000 / totalWeightGained).toFixed(2)
      : '0';

    // Get vaccination completion rate
    const vaccinations = await this.vaccinationRepository.find({
      where: { batch_id: batchId },
    });

    const completedVaccinations = vaccinations.filter(
      (v) => v.vaccination_status === 'completed',
    ).length;

    const vaccinationCompletionRate = vaccinations.length > 0
      ? ((completedVaccinations / vaccinations.length) * 100).toFixed(2)
      : '0';

    return {
      age_in_days: ageInDays,
      initial_count: batch.initial_count,
      current_count: batch.current_count,
      total_deaths: totalDeaths,
      mortality_rate: `${mortalityRate}%`,
      average_weight_grams: latestWeight,
      total_feed_consumed_kg: totalFeedConsumed,
      total_feed_cost: totalFeedCost,
      feed_conversion_ratio: fcr,
      vaccination_completion_rate: `${vaccinationCompletionRate}%`,
      days_remaining: batch.expected_end_date
        ? Math.max(
            0,
            Math.floor(
              (new Date(batch.expected_end_date).getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null,
    };
  }

  private async createHistoryRecord(
    batch: Batch,
    previousCount: number,
    currentCount: number,
    changeType: string,
    changeAmount: number,
    reason: string,
    userId: string,
  ) {
    const history = this.batchHistoryRepository.create({
      batch_id: batch.id,
      created_by: userId,
      previous_count: previousCount,
      current_count: currentCount,
      change_type: changeType,
      change_amount: changeAmount,
      reason: reason,
      hatch_date: batch.hatch_date,
      start_date: batch.start_date,
      expected_end_date: batch.expected_end_date,
      actual_end_date: batch.actual_end_date,
      batch_status: batch.current_status,
      notes: reason,
    });

    await this.batchHistoryRepository.save(history);
  }
}
