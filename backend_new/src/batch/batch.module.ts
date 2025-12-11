// batchs.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';
import { Batch } from '../database/entities/Batch.entity';
import { BatchHistory } from '../database/entities/BatchHistory.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { FeedingSchedule } from '../database/entities/FeedingSchedule.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { BirdType } from 'src/database/entities/BirdType.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Batch,
      BatchHistory,
      Vaccination,
      FeedingSchedule,
      FeedingRecord,
      WeightSample,
      AuditLog,
      BirdType,
    ]),
    UploadsModule,
  ],
  controllers: [BatchController],
  providers: [BatchService, CustomLogger, AuditService],
  exports: [BatchService],
})
export class BatchModule {}
