// modules/extension-officer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtensionOfficer } from '../database/entities/ExtensionOfficer.entity';
import { FieldAppraisal } from '../database/entities/FieldAppraisal.entity';
import { User } from '../database/entities/User.entity';
import { Farm } from '../database/entities/Farm.entity';
import { ExtensionOfficerService } from './extension-officer.service';
import { FieldAppraisalService } from './field-appraisal.service';
import { ExtensionOfficerController } from './extension-officer.controller';
import { FieldAppraisalController } from './field-appraisal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtensionOfficer, FieldAppraisal, User, Farm]),
  ],
  controllers: [ExtensionOfficerController, FieldAppraisalController],
  providers: [ExtensionOfficerService, FieldAppraisalService],
  exports: [ExtensionOfficerService, FieldAppraisalService],
})
export class ExtensionOfficerModule {}
