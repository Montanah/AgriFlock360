// roles/roles.controller.ts
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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AssignPermissionsDto} from '../permissions/dto/permissions.dto';
import { QueryRolesDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async createRole(@Body() createDto: CreateRoleDto) {
    const role = await this.rolesService.createRole(createDto);

    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  }

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get all roles with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated roles' })
  async getRoles(@Query() query: QueryRolesDto) {
    const result = await this.rolesService.getRoles(query);

    return {
      success: true,
      data: result.roles,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get a specific role' })
  @ApiResponse({ status: 200, description: 'Returns role details with permissions' })
  async getRole(@Param('id') id: string) {
    const role = await this.rolesService.getRole(id);

    return {
      success: true,
      data: role,
    };
  }

  @Get(':id/permissions')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get role permissions grouped by module' })
  @ApiResponse({ status: 200, description: 'Returns permissions grouped by module' })
  async getRolePermissions(@Param('id') id: string) {
    const permissions = await this.rolesService.getRolePermissionsByModule(id);

    return {
      success: true,
      data: permissions,
    };
  }

  @Put(':id')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async updateRole(@Param('id') id: string, @Body() updateDto: UpdateRoleDto) {
    const role = await this.rolesService.updateRole(id, updateDto);

    return {
      success: true,
      message: 'Role updated successfully',
      data: role,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.delete')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.deleteRole(id);
  }

  @Post(':id/permissions')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Assign permissions to a role (replaces all)' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  async assignPermissions(@Param('id') id: string, @Body() assignDto: AssignPermissionsDto) {
    const role = await this.rolesService.assignPermissions(id, assignDto);

    return {
      success: true,
      message: 'Permissions assigned successfully',
      data: role,
    };
  }

  @Post(':id/permissions/:permissionId')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Add a single permission to role' })
  @ApiResponse({ status: 200, description: 'Permission added successfully' })
  async addPermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    const role = await this.rolesService.addPermissionToRole(id, permissionId);

    return {
      success: true,
      message: 'Permission added to role',
      data: role,
    };
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Remove a permission from role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    const role = await this.rolesService.removePermissionFromRole(id, permissionId);

    return {
      success: true,
      message: 'Permission removed from role',
      data: role,
    };
  }

  @Post('seed')
  @RequirePermissions('system.admin')
  @ApiOperation({ summary: 'Seed default roles' })
  @ApiResponse({ status: 200, description: 'Default roles seeded' })
  async seedRoles() {
    await this.rolesService.seedDefaultRoles();

    return {
      success: true,
      message: 'Default roles seeded successfully',
    };
  }
}