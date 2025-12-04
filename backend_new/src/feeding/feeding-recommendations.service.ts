// feeding/services/feeding-recommendations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { FeedingRecommendation } from '../database/entities/FeedingRecommendation.entity';
import { BirdType } from '../database/entities/BirdType.entity';
import { CreateFeedingRecommendationDto, UpdateFeedingRecommendationDto, QueryRecommendationsDto } from './dto/feeding.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class FeedingRecommendationsService {
  constructor(
    @InjectRepository(FeedingRecommendation)
    private recommendationRepository: Repository<FeedingRecommendation>,
    @InjectRepository(BirdType)
    private birdTypeRepository: Repository<BirdType>,
    private logger: CustomLogger,
  ) {}

  async createRecommendation(
    createDto: CreateFeedingRecommendationDto,
  ): Promise<FeedingRecommendation> {
    // Verify bird type exists
    const birdType = await this.birdTypeRepository.findOne({
      where: { id: createDto.bird_type_id },
    });

    if (!birdType) {
      throw new NotFoundException('Bird type not found');
    }

    // Validate age range
    if (createDto.age_end <= createDto.age_start) {
      throw new BadRequestException('Age end must be greater than age start');
    }

    // Check for overlapping recommendations
    const overlapping = await this.recommendationRepository
      .createQueryBuilder('rec')
      .where('rec.bird_type_id = :birdTypeId', { birdTypeId: createDto.bird_type_id })
      .andWhere('rec.is_active = true')
      .andWhere(
        '(rec.age_start <= :ageEnd AND rec.age_end >= :ageStart)',
        { ageStart: createDto.age_start, ageEnd: createDto.age_end },
      )
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        `Recommendation overlaps with existing ${overlapping.stage_name} (${overlapping.age_start}-${overlapping.age_end} days)`,
      );
    }

    const recommendation = this.recommendationRepository.create(createDto);
    await this.recommendationRepository.save(recommendation);

    this.logger.log(
      `Feeding recommendation created: ${recommendation.stage_name} for ${birdType.name}`,
    );

    return this.getRecommendation(recommendation.id);
  }

  async getRecommendations(query: QueryRecommendationsDto) {
    const { bird_type_id, stage_name, age, active_only, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.recommendationRepository
      .createQueryBuilder('rec')
      .leftJoinAndSelect('rec.bird_type', 'bird_type')
      .skip(skip)
      .take(limit)
      .orderBy('bird_type.name', 'ASC')
      .addOrderBy('rec.age_start', 'ASC');

    if (bird_type_id) {
      queryBuilder.andWhere('rec.bird_type_id = :bird_type_id', { bird_type_id });
    }

    if (stage_name) {
      queryBuilder.andWhere('rec.stage_name ILIKE :stage_name', {
        stage_name: `%${stage_name}%`,
      });
    }

    if (age !== undefined) {
      queryBuilder.andWhere('rec.age_start <= :age AND rec.age_end >= :age', { age });
    }

    if (active_only) {
      queryBuilder.andWhere('rec.is_active = true');
    }

    const [recommendations, total] = await queryBuilder.getManyAndCount();

    return {
      recommendations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecommendation(id: string): Promise<FeedingRecommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: ['bird_type'],
    });

    if (!recommendation) {
      throw new NotFoundException('Feeding recommendation not found');
    }

    return recommendation;
  }

  async getRecommendationsByBirdType(birdTypeId: string): Promise<FeedingRecommendation[]> {
    return this.recommendationRepository.find({
      where: { bird_type_id: birdTypeId, is_active: true },
      order: { age_start: 'ASC' },
    });
  }

  async getRecommendationForAge(
    birdTypeId: string,
    age: number,
  ): Promise<FeedingRecommendation | null> {
    return this.recommendationRepository.findOne({
      where: {
        bird_type_id: birdTypeId,
        age_start: LessThanOrEqual(age),
        age_end: MoreThanOrEqual(age),
        is_active: true,
      },
      relations: ['bird_type'],
    });
  }

  async updateRecommendation(
    id: string,
    updateDto: UpdateFeedingRecommendationDto,
  ): Promise<FeedingRecommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
    });

    if (!recommendation) {
      throw new NotFoundException('Feeding recommendation not found');
    }

    if (recommendation.is_system_default) {
      throw new BadRequestException('Cannot modify system default recommendations');
    }

    // Validate age range if being updated
    if (updateDto.age_start !== undefined && updateDto.age_end !== undefined) {
      if (updateDto.age_end <= updateDto.age_start) {
        throw new BadRequestException('Age end must be greater than age start');
      }
    }

    // Check for bird type change
    if (updateDto.bird_type_id && updateDto.bird_type_id !== recommendation.bird_type_id) {
      const birdType = await this.birdTypeRepository.findOne({
        where: { id: updateDto.bird_type_id },
      });

      if (!birdType) {
        throw new NotFoundException('Bird type not found');
      }
    }

    Object.assign(recommendation, updateDto);
    await this.recommendationRepository.save(recommendation);

    this.logger.log(`Feeding recommendation updated: ${recommendation.stage_name}`);

    return this.getRecommendation(id);
  }

  async deleteRecommendation(id: string): Promise<void> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
    });

    if (!recommendation) {
      throw new NotFoundException('Feeding recommendation not found');
    }

    if (recommendation.is_system_default) {
      throw new BadRequestException('Cannot delete system default recommendations');
    }

    await this.recommendationRepository.remove(recommendation);

    this.logger.log(`Feeding recommendation deleted: ${recommendation.stage_name}`);
  }

  // Seed default recommendations
  async seedDefaultRecommendations(): Promise<void> {
    const defaultRecommendations = await this.getDefaultRecommendationsData();
    console.log(defaultRecommendations);
    for (const recData of defaultRecommendations) {
      try {
        // Find bird type
        let birdType = await this.birdTypeRepository.findOne({
          where: { name: recData.birdTypeName },
        });

        // Create bird type if doesn't exist
        if (!birdType) {
          birdType = this.birdTypeRepository.create({
            name: recData.birdTypeName,
            category: recData.category,
            description: recData.description,
          });
          await this.birdTypeRepository.save(birdType);
        }

        // Check if recommendation exists
        const existing = await this.recommendationRepository.findOne({
          where: {
            bird_type_id: birdType.id,
            stage_name: recData.stage_name,
            age_start: recData.age_start,
          },
        });

        if (!existing) {
          const recommendation = this.recommendationRepository.create({
            bird_type_id: birdType.id,
            stage_name: recData.stage_name,
            age_start: recData.age_start,
            ...recData.recommendation,
            is_system_default: true,
          });
          await this.recommendationRepository.save(recommendation);
          this.logger.log(`Seeded: ${recData.stage_name} for ${recData.birdTypeName}`);
        }
      } catch (error) {
        this.logger.error(`Failed to seed recommendation: ${recData.stage_name}`, error);
      }
    }

    this.logger.log('Default feeding recommendations seeded');
  }

  private async getDefaultRecommendationsData() {
    return [
      // BROILERS
      {
        birdTypeName: 'Broiler',
        category: 'broiler',
        description: 'Fast-growing birds for meat production',
        stage_name: 'Starter',
        age_start: 0,
        recommendation: {
          age_end: 14,
          feed_type: 'Starter mash',
          protein_percentage: 23.0,
          quantity_per_bird_per_day: 0.035,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'High protein for rapid growth',
          supplements: 'Vitamin supplements recommended',
          metadata: {
            energy_level: 'High',
            special_requirements: ['Clean water always available', 'Feed ad libitum'],
          },
        },
      },
      {
        birdTypeName: 'Broiler',
        category: 'broiler',
        description: 'Fast-growing birds for meat production',
        stage_name: 'Grower',
        age_start: 15,
        recommendation: {
          age_end: 28,
          feed_type: 'Grower mash',
          protein_percentage: 21.0,
          quantity_per_bird_per_day: 0.075,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Support rapid body growth',
          metadata: {
            energy_level: 'High',
            special_requirements: ['Monitor weight gain', 'Increase feed quantity'],
          },
        },
      },
      {
        birdTypeName: 'Broiler',
        category: 'broiler',
        description: 'Fast-growing birds for meat production',
        stage_name: 'Finisher',
        age_start: 29,
        recommendation: {
          age_end: 42,
          feed_type: 'Finisher mash',
          protein_percentage: 19.0,
          quantity_per_bird_per_day: 0.120,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Helps gain final weight before processing',
          metadata: {
            energy_level: 'High',
            special_requirements: ['Feed 24/7 if under lights', 'Target 2-2.5kg live weight'],
          },
        },
      },
      // LAYERS
      {
        birdTypeName: 'Layer',
        category: 'layer',
        description: 'Birds for egg production',
        stage_name: 'Chick/Starter',
        age_start: 0,
        recommendation: {
          age_end: 42,
          feed_type: 'Chick mash',
          protein_percentage: 18.0,
          quantity_per_bird_per_day: 0.025,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '17:00'] },
          notes: 'Foundation for strong growth',
          metadata: {
            special_requirements: ['Clean water essential', 'Increase gradually'],
          },
        },
      },
      {
        birdTypeName: 'Layer',
        category: 'layer',
        description: 'Birds for egg production',
        stage_name: 'Grower',
        age_start: 43,
        recommendation: {
          age_end: 126,
          feed_type: 'Grower mash',
          protein_percentage: 16.0,
          quantity_per_bird_per_day: 0.055,
          times_per_day: 2,
          feeding_times: { slots: ['06:00', '16:00'] },
          notes: 'Prepares for laying',
          metadata: {
            special_requirements: ['Monitor body weight', 'Prepare for laying'],
          },
        },
      },
      {
        birdTypeName: 'Layer',
        category: 'layer',
        description: 'Birds for egg production',
        stage_name: 'Layer',
        age_start: 127,
        recommendation: {
          age_end: 730,
          feed_type: 'Layer mash',
          protein_percentage: 17.0,
          quantity_per_bird_per_day: 0.120,
          times_per_day: 2,
          feeding_times: { slots: ['06:00', '16:00'] },
          notes: 'Supports continuous egg production',
          supplements: 'Extra calcium (crushed shells or limestone) for strong eggshells',
          metadata: {
            calcium_percentage: 3.5,
            special_requirements: ['Calcium crucial for shells', 'Consistent feeding times'],
          },
        },
      },
      // KIENYEJI/INDIGENOUS
      {
        birdTypeName: 'Kienyeji',
        category: 'kienyeji',
        description: 'Indigenous/local breed chickens',
        stage_name: 'Starter',
        age_start: 0,
        recommendation: {
          age_end: 56,
          feed_type: 'Starter mash',
          protein_percentage: 18.0,
          quantity_per_bird_per_day: 0.030,
          times_per_day: 2,
          feeding_times: { slots: ['07:00', '17:00'] },
          notes: 'Hardy birds, can supplement with scavenging',
          metadata: {
            special_requirements: ['Can free-range', 'Supplement with kitchen scraps'],
          },
        },
      },
      {
        birdTypeName: 'Kienyeji',
        category: 'kienyeji',
        description: 'Indigenous/local breed chickens',
        stage_name: 'Grower',
        age_start: 57,
        recommendation: {
          age_end: 140,
          feed_type: 'Grower mash',
          protein_percentage: 16.0,
          quantity_per_bird_per_day: 0.060,
          times_per_day: 2,
          feeding_times: { slots: ['07:00', '17:00'] },
          notes: 'Slower growth, allow scavenging',
          supplements: 'Greens, insects, and grains',
          metadata: {
            special_requirements: ['Encourage foraging', 'Add greens daily'],
          },
        },
      },
      {
        birdTypeName: 'Kienyeji',
        category: 'kienyeji',
        description: 'Indigenous/local breed chickens',
        stage_name: 'Adult/Layer',
        age_start: 141,
        recommendation: {
          age_end: 1095,
          feed_type: 'Layer or finisher + scavenging',
          protein_percentage: 16.0,
          quantity_per_bird_per_day: 0.080,
          times_per_day: 2,
          feeding_times: { slots: ['07:00', '17:00'] },
          notes: 'Can produce eggs or meat',
          supplements: 'Kitchen scraps, greens, insects',
          metadata: {
            special_requirements: ['Free range beneficial', 'Natural foraging supplements feed'],
          },
        },
      },
      // DUCKS
      {
        birdTypeName: 'Duck',
        category: 'duck',
        description: 'Waterfowl for meat and eggs',
        stage_name: 'Starter',
        age_start: 0,
        recommendation: {
          age_end: 14,
          feed_type: 'Starter mash (non-medicated)',
          protein_percentage: 20.0,
          quantity_per_bird_per_day: 0.040,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'MUST be non-medicated feed',
          supplements: 'Add niacin supplement',
          metadata: {
            special_requirements: [
              'Non-medicated feed only',
              'Water access when feeding',
              'Ducks eat more than chickens',
            ],
          },
        },
      },
      {
        birdTypeName: 'Duck',
        category: 'duck',
        description: 'Waterfowl for meat and eggs',
        stage_name: 'Grower/Layer',
        age_start: 15,
        recommendation: {
          age_end: 365,
          feed_type: 'Grower or layer mash',
          protein_percentage: 16.0,
          quantity_per_bird_per_day: 0.180,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Add greens and water plants',
          supplements: 'Greens, vegetables, water access',
          metadata: {
            special_requirements: ['Swimming water beneficial', 'Higher feed consumption'],
          },
        },
      },
      // TURKEYS
      {
        birdTypeName: 'Turkey',
        category: 'turkey',
        description: 'Large birds for meat production',
        stage_name: 'Starter',
        age_start: 0,
        recommendation: {
          age_end: 42,
          feed_type: 'Turkey starter',
          protein_percentage: 28.0,
          quantity_per_bird_per_day: 0.080,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Very high protein needed',
          metadata: {
            special_requirements: ['Higher protein than chickens', 'Clean water essential'],
          },
        },
      },
      {
        birdTypeName: 'Turkey',
        category: 'turkey',
        description: 'Large birds for meat production',
        stage_name: 'Grower',
        age_start: 43,
        recommendation: {
          age_end: 84,
          feed_type: 'Turkey grower',
          protein_percentage: 22.0,
          quantity_per_bird_per_day: 0.180,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Rapid growth phase',
          metadata: {
            special_requirements: ['Monitor weight gain', 'Increase feed gradually'],
          },
        },
      },
      {
        birdTypeName: 'Turkey',
        category: 'turkey',
        description: 'Large birds for meat production',
        stage_name: 'Finisher',
        age_start: 85,
        recommendation: {
          age_end: 150,
          feed_type: 'Turkey finisher',
          protein_percentage: 20.0,
          quantity_per_bird_per_day: 0.300,
          times_per_day: 3,
          feeding_times: { slots: ['06:00', '12:00', '18:00'] },
          notes: 'Final weight gain before processing',
          metadata: {
            special_requirements: ['Large feed capacity', 'Target 10-15kg live weight'],
          },
        },
      },
    ];
  }
}
