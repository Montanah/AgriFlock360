import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedingController } from './feeding.controller';
import { WeightSamplesController } from './weight-samples.controller';
import { CustomLogger } from '../common/custom-logger.service';
import { FeedingSchedule } from '../database/entities/FeedingSchedule.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { Batch } from '../database/entities/Batch.entity';
import { FeedingRecommendationsController } from './feeding-recommendations.controller';
import { FeedingRecommendationsService } from './feeding-recommendations.service';
import { FeedingService } from './feeding.service';
import { FeedingRecommendation } from '../database/entities/FeedingRecommendation.entity';
import { BirdType } from '../database/entities/BirdType.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedingSchedule,
      FeedingRecord,
      WeightSample,
      Batch,
      FeedingRecommendation,
      BirdType,
    ]),
    UsersModule,
  ],
  controllers: [
    FeedingController,
    WeightSamplesController,
    FeedingRecommendationsController,
  ],
  providers: [
    FeedingRecommendationsService,
    FeedingService,
    CustomLogger,
    PermissionsGuard,
  ],
  exports: [FeedingRecommendationsService, FeedingService],
})
export class FeedingModule {}
