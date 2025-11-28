// analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Device } from '../database/entities/Device.entity';
import { Batch } from '../database/entities/Batch.entity';
import { Alert } from '../database/entities/Alert.entity';
import { Payment } from '../database/entities/Payment.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { User } from '../database/entities/User.entity';
import { Farm } from '../database/entities/Farm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device,
      Batch,
      Alert,
      Payment,
      Vaccination,
      User,
      Farm,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class AnalyticsModule {}