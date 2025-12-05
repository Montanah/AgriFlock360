// services/field-appraisal.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { FieldAppraisal } from '../database/entities/FieldAppraisal.entity';
import {
  CreateFieldAppraisalDto,
  UpdateFieldAppraisalDto,
  QueryFieldAppraisalDto,
} from './dto/create-field-appraisal.dto';
import { ExtensionOfficerService } from './extension-officer.service';

@Injectable()
export class FieldAppraisalService {
  constructor(
    @InjectRepository(FieldAppraisal)
    private readonly appraisalRepository: Repository<FieldAppraisal>,
    private readonly officerService: ExtensionOfficerService,
  ) {}

  async create(dto: CreateFieldAppraisalDto): Promise<FieldAppraisal> {
    // Verify officer exists
    await this.officerService.findOne(dto.officer_id);

    // Calculate overall score if not provided
    let overallScore = dto.overall_score || 0;

    if (!dto.overall_score) {
      overallScore = this.calculateOverallScore(dto);
    }

    const appraisal = this.appraisalRepository.create({
      ...dto,
      overall_score: overallScore,
      status: dto.status || 'completed',
    });

    const saved = await this.appraisalRepository.save(appraisal);

    // Update officer statistics
    await this.officerService.updateStatistics(dto.officer_id);

    return saved;
  }

  private calculateOverallScore(dto: CreateFieldAppraisalDto): number {
    const scores = [
      dto.structure_integrity_score || 0,
      dto.ventilation_score || 0,
      dto.hygiene_score || 0,
      dto.biosecurity_score || 0,
      dto.feed_storage_score || 0,
      dto.water_reliability_score || 0,
      dto.farmer_knowledge_score || 0,
    ];

    // Convert 0-10 scores to 0-100 scale
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = scores.length * 10;

    return Math.round((totalScore / maxScore) * 100);
  }

  async findAll(query: QueryFieldAppraisalDto): Promise<{
    data: FieldAppraisal[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      officer_id,
      farmer_id,
      farm_id,
      status,
      fraud_flag_raised,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.appraisalRepository
      .createQueryBuilder('appraisal')
      .leftJoinAndSelect('appraisal.officer', 'officer')
      .leftJoinAndSelect('appraisal.farmer', 'farmer')
      .leftJoinAndSelect('appraisal.farm', 'farm');

    if (officer_id) {
      queryBuilder.andWhere('appraisal.officer_id = :officer_id', {
        officer_id,
      });
    }

    if (farmer_id) {
      queryBuilder.andWhere('appraisal.farmer_id = :farmer_id', {
        farmer_id,
      });
    }

    if (farm_id) {
      queryBuilder.andWhere('appraisal.farm_id = :farm_id', { farm_id });
    }

    if (status) {
      queryBuilder.andWhere('appraisal.status = :status', { status });
    }

    if (fraud_flag_raised !== undefined) {
      queryBuilder.andWhere(
        'appraisal.fraud_flag_raised = :fraud_flag_raised',
        { fraud_flag_raised },
      );
    }

    if (start_date && end_date) {
      queryBuilder.andWhere(
        'appraisal.visit_date BETWEEN :start_date AND :end_date',
        { start_date, end_date },
      );
    } else if (start_date) {
      queryBuilder.andWhere('appraisal.visit_date >= :start_date', {
        start_date,
      });
    } else if (end_date) {
      queryBuilder.andWhere('appraisal.visit_date <= :end_date', {
        end_date,
      });
    }

    queryBuilder.orderBy('appraisal.visit_date', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FieldAppraisal> {
    const appraisal = await this.appraisalRepository.findOne({
      where: { id },
      relations: ['officer', 'farmer', 'farm'],
    });

    if (!appraisal) {
      throw new NotFoundException('Field appraisal not found');
    }

    return appraisal;
  }

  async update(
    id: string,
    dto: UpdateFieldAppraisalDto,
  ): Promise<FieldAppraisal> {
    const appraisal = await this.findOne(id);

    // Recalculate overall score if relevant fields are updated
    if (
      dto.structure_integrity_score !== undefined ||
      dto.ventilation_score !== undefined ||
      dto.hygiene_score !== undefined ||
      dto.biosecurity_score !== undefined ||
      dto.feed_storage_score !== undefined ||
      dto.water_reliability_score !== undefined ||
      dto.farmer_knowledge_score !== undefined
    ) {
      const updatedDto = { ...appraisal, ...dto };
      dto.overall_score = this.calculateOverallScore(updatedDto as any);
    }

    Object.assign(appraisal, dto);
    const updated = await this.appraisalRepository.save(appraisal);

    // Update officer statistics if rating changed
    if (dto.farmer_rating !== undefined) {
      await this.officerService.updateStatistics(appraisal.officer_id);
    }

    return updated;
  }

  async addFarmerFeedback(
    id: string,
    rating: number,
    feedback: string,
  ): Promise<FieldAppraisal> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const appraisal = await this.findOne(id);

    appraisal.farmer_rating = rating;
    appraisal.farmer_feedback = feedback;

    const updated = await this.appraisalRepository.save(appraisal);

    // Update officer statistics
    await this.officerService.updateStatistics(appraisal.officer_id);

    return updated;
  }

  async getFraudFlagged(): Promise<FieldAppraisal[]> {
    return await this.appraisalRepository.find({
      where: { fraud_flag_raised: true },
      relations: ['officer', 'farmer', 'farm'],
      order: { visit_date: 'DESC' },
    });
  }

  async getAppraisalsByOfficer(
    officerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FieldAppraisal[]> {
    const queryBuilder = this.appraisalRepository
      .createQueryBuilder('appraisal')
      .where('appraisal.officer_id = :officerId', { officerId });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'appraisal.visit_date BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    return await queryBuilder.orderBy('appraisal.visit_date', 'DESC').getMany();
  }

  async getAppraisalsByFarmer(farmerId: string): Promise<FieldAppraisal[]> {
    return await this.appraisalRepository.find({
      where: { farmer_id: farmerId },
      relations: ['officer', 'farm'],
      order: { visit_date: 'DESC' },
    });
  }

  async getUpcomingFollowUps(): Promise<FieldAppraisal[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return await this.appraisalRepository.find({
      where: {
        follow_up_date: Between(today, thirtyDaysFromNow),
        status: 'requires_follow_up',
      },
      relations: ['officer', 'farmer', 'farm'],
      order: { follow_up_date: 'ASC' },
    });
  }

  async getStatistics(officerId?: string, startDate?: Date, endDate?: Date) {
    const queryBuilder =
      this.appraisalRepository.createQueryBuilder('appraisal');

    if (officerId) {
      queryBuilder.where('appraisal.officer_id = :officerId', {
        officerId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'appraisal.visit_date BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const appraisals = await queryBuilder.getMany();

    const totalAppraisals = appraisals.length;
    const fraudFlags = appraisals.filter((a) => a.fraud_flag_raised).length;

    const avgScore =
      totalAppraisals > 0
        ? appraisals.reduce((sum, a) => sum + a.overall_score, 0) /
          totalAppraisals
        : 0;

    const avgRating =
      appraisals.filter((a) => a.farmer_rating).length > 0
        ? appraisals
            .filter((a) => a.farmer_rating)
            .reduce((sum, a) => sum + (a.farmer_rating || 0), 0) /
          appraisals.filter((a) => a.farmer_rating).length
        : 0;

    return {
      total_appraisals: totalAppraisals,
      fraud_flags: fraudFlags,
      average_score: Number(avgScore.toFixed(2)),
      average_rating: Number(avgRating.toFixed(2)),
      by_status: {
        completed: appraisals.filter((a) => a.status === 'completed').length,
        pending: appraisals.filter((a) => a.status === 'pending').length,
        in_progress: appraisals.filter((a) => a.status === 'in_progress')
          .length,
        requires_follow_up: appraisals.filter(
          (a) => a.status === 'requires_follow_up',
        ).length,
      },
    };
  }

  async delete(id: string): Promise<void> {
    const appraisal = await this.findOne(id);
    const officerId = appraisal.officer_id;

    await this.appraisalRepository.remove(appraisal);

    // Update officer statistics
    await this.officerService.updateStatistics(officerId);
  }
}
