import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Sync } from './entities/sync.entity';
import { Farm } from '../database/entities/Farm.entity';
import { Batch } from '../database/entities/Batch.entity';
import { Device } from '../database/entities/Device.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { User } from '../database/entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sync,
      Farm,
      Batch,
      Device,
      Vaccination,
      FeedingRecord,
      User,
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
