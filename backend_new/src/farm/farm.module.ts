import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsController } from './farm.controller';
import { FarmsService } from './farm.service';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';
import { Farm } from '../database/entities/Farm.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm, AuditLog]),
  ],
  controllers: [FarmsController],
  providers: [FarmsService, CustomLogger, AuditService],
  exports: [FarmsService],
})
export class FarmModule {}
