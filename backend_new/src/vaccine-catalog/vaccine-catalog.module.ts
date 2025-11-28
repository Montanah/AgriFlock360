// vaccine-catalog/vaccine-catalog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccineCatalogController } from './vaccine-catalog.controller';
import { VaccineCatalogService } from './vaccine-catalog.service';
import { VaccineCatalog } from '../database/entities/VaccineCatalog.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([VaccineCatalog]), UsersModule],
  controllers: [VaccineCatalogController],
  providers: [VaccineCatalogService, CustomLogger, PermissionsGuard],
  exports: [VaccineCatalogService],
})
export class VaccineCatalogModule {}
