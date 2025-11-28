// roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '../database/entities/Role.entity';
import { Permission } from '../database/entities/Permission.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CustomLogger } from '../common/custom-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    PermissionsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, CustomLogger],
  exports: [RolesService],
})
export class RolesModule {}
