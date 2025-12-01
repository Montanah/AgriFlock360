// housing/housing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HousingMaterialsController } from './housing.controller';
import { HousingQuotationsController } from './housing-quotations.controller';
import { HousingMaterialsService } from './housing-materials.service';
import { HousingQuotationsService } from './housing-quotations.service';
import { HousingMaterial } from '../database/entities/HousingMaterial.entity';
import { HousingQuantity } from '../database/entities/HousingQuantity.entity';
import { HousingQuotation } from '../database/entities/HousingQuotation.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HousingMaterial,
      HousingQuantity,
      HousingQuotation,
    ]),
    UsersModule
  ],
  controllers: [HousingMaterialsController, HousingQuotationsController],
  providers: [HousingMaterialsService, HousingQuotationsService, CustomLogger, PermissionsGuard],
  exports: [HousingMaterialsService, HousingQuotationsService],
})
export class HousingModule {}
