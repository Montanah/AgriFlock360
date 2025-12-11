// reports/reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Batch } from '../database/entities/Batch.entity';
import { BatchHistory } from '../database/entities/BatchHistory.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { Device } from '../database/entities/Device.entity';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { CustomLogger } from '../common/custom-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Batch,
      BatchHistory,
      Vaccination,
      FeedingRecord,
      WeightSample,
      Device,
      Telemetry,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, CustomLogger],
  exports: [ReportsService],
})
export class ReportsModule {}
