import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsController } from './farm.controller';
import { FarmsService } from './farm.service';
import { CustomLogger } from '../common/custom-logger.service';
import { UploadsModule } from '../uploads/uploads.module';
import { Farm } from '../database/entities/Farm.entity';
import { Batch } from '../database/entities/Batch.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm, AuditLog, Batch]),
    UploadsModule,
  ],
  controllers: [FarmsController],
  providers: [FarmsService, CustomLogger],
  exports: [FarmsService],
})
export class FarmModule {}
