// permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from '../database/entities/Permission.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CustomLogger } from '../common/custom-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), AuthModule, UsersModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, CustomLogger],
  exports: [PermissionsService],
})
export class PermissionsModule {}
