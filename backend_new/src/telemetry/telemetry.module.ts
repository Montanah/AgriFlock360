import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { Device } from '../database/entities/Device.entity';
import { Alert } from '../database/entities/Alert.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Telemetry, Device, Alert]),
    NotificationsModule,
  ],
  providers: [TelemetryService, CustomLogger],
  exports: [TelemetryService, CustomLogger],
})
export class TelemetryModule {}
