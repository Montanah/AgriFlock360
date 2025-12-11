// uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload } from '../database/entities/Upload.entity';
import { User } from '../database/entities/User.entity';
import { CustomLogger } from '../common/custom-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upload, User]), ConfigModule],
  controllers: [UploadsController],
  providers: [UploadsService, CustomLogger],
  exports: [UploadsService],
})
export class UploadsModule {}
