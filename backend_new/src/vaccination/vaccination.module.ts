import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationsController } from './vaccination.controller';
import { VaccinationsService } from './vaccinations.service';
import { CustomLogger } from '../common/custom-logger.service';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { Batch } from '../database/entities/Batch.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { VaccineCatalog } from '../database/entities/VaccineCatalog.entity';
import { VaccineCatalogModule } from '../vaccine-catalog/vaccine-catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vaccination, Batch, VaccineCatalog]),
    NotificationsModule,
    VaccineCatalogModule,
  ],
  controllers: [VaccinationsController],
  providers: [VaccinationsService, CustomLogger],
  exports: [VaccinationsService],
})
export class VaccinationModule {}
