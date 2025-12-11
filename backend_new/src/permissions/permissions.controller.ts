// permissions/permissions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionsDto,
} from './dto/permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async createPermission(@Body() createDto: CreatePermissionDto) {
    const permission =
      await this.permissionsService.createPermission(createDto);

    return {
      success: true,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  @Post('bulk')
  @RequirePermissions('permissions.create')
  @ApiOperation({ summary: 'Create multiple permissions at once' })
  @ApiResponse({ status: 201, description: 'Permissions created successfully' })
  async createBulkPermissions(@Body() permissions: CreatePermissionDto[]) {
    const createdPermissions =
      await this.permissionsService.createBulkPermissions(permissions);

    return {
      success: true,
      message: `${createdPermissions.length} permission(s) created successfully`,
      data: createdPermissions,
    };
  }

  @Get()
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get all permissions with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated permissions' })
  async getPermissions(@Query() query: QueryPermissionsDto) {
    const result = await this.permissionsService.getPermissions(query);

    return {
      success: true,
      data: result.permissions,
      pagination: result.pagination,
    };
  }

  @Get('modules')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get all unique modules' })
  @ApiResponse({ status: 200, description: 'Returns list of modules' })
  async getModules() {
    const modules = await this.permissionsService.getModules();

    return {
      success: true,
      data: modules,
    };
  }

  @Get('by-module/:module')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get permissions by module' })
  @ApiResponse({
    status: 200,
    description: 'Returns permissions for the module',
  })
  async getPermissionsByModule(@Param('module') module: string) {
    const permissions =
      await this.permissionsService.getPermissionsByModule(module);

    return {
      success: true,
      data: permissions,
    };
  }

  @Get(':id')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get a specific permission' })
  @ApiResponse({ status: 200, description: 'Returns permission details' })
  async getPermission(@Param('id') id: string) {
    const permission = await this.permissionsService.getPermission(id);

    return {
      success: true,
      data: permission,
    };
  }

  @Put(':id')
  @RequirePermissions('permissions.update')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.updatePermission(
      id,
      updateDto,
    );

    return {
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('permissions.delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  async deletePermission(@Param('id') id: string) {
    await this.permissionsService.deletePermission(id);
  }

  @Post('seed')
  @RequirePermissions('system.admin')
  @ApiOperation({ summary: 'Seed default permissions' })
  @ApiResponse({ status: 200, description: 'Default permissions seeded' })
  async seedPermissions() {
    await this.permissionsService.seedDefaultPermissions();

    return {
      success: true,
      message: 'Default permissions seeded successfully',
    };
  }
}
