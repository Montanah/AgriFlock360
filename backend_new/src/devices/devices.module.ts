// devices/devices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { TelemetryController } from '../telemetry/telemetry.controller';
import { AlertsController } from './alerts.controller';
import { DevicesService } from './devices.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { Device } from '../database/entities/Device.entity';
import { DeviceStatus } from '../database/entities/DeviceStatus.entity';
import { CommandType } from '../database/entities/CommandType.entity';
import { IssuedDeviceCommand } from '../database/entities/IssuedDeviceCommand.entity';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { Alert } from '../database/entities/Alert.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { MulterModule } from '@nestjs/platform-express';
import { FirmwareController } from './firmware.controller';
import { OtaController } from './ota.controller';
import { FirmwareService } from './firmware.service';
import { OtaService } from './ota.service';
import { FirmwareVersion } from '../database/entities/Firmware.entity';
import { OtaUpdate } from '../database/entities/OtaUpdate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device,
      DeviceStatus,
      CommandType,
      IssuedDeviceCommand,
      Telemetry,
      Alert,
      AuditLog,
      FirmwareVersion,
      OtaUpdate,
    ]),
    NotificationsModule,
    MqttModule,
    TelemetryModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  ],
  controllers: [DevicesController, TelemetryController, AlertsController, FirmwareController, OtaController,],
  providers: [DevicesService, CustomLogger, AuditService,  FirmwareService,
    OtaService,],
  exports: [DevicesService, FirmwareService, OtaService],
  
})
export class DevicesModule {}
