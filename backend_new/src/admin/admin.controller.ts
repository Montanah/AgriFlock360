// admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { QueryLogsDto, UpdateConfigDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../database/entities/User.entity';
import { Device } from '../database/entities/Device.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getLogs(@Query() query: QueryLogsDto) {
    return this.adminService.getLogs(query);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'System config retrieved' })
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({ status: 200, description: 'Config updated successfully' })
  async updateConfig(
    @Body() updateConfigDto: UpdateConfigDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.adminService.updateConfig(
      updateConfigDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Get('users')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC');

    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove sensitive data
    const sanitizedUsers = users.map((user) => {
      const { password_hash, refresh_token, ...sanitized } = user as any;
      return sanitized;
    });

    return {
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('users/:userId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  async getUser(@Param('userId') userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, refresh_token, ...sanitized } = user as any;
    return { user: sanitized };
  }

  @Patch('users/:userId/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: UserStatus },
  ) {
    if (!body || !body.status) {
      // throw new Error('Status is required');
      return { message: 'Status is required' };
    }
    await this.userRepository.update(userId, { status: body.status });
    return { success: true };
  }

  @Delete('users/:userId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('userId') userId: string) {
    await this.userRepository.update(userId, {
      status: 'deleted',
      is_active: false,
      deleted_at: new Date(),
    });
    return { success: true };
  }

  @Get('devices')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('devices.read')
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'Devices retrieved' })
  async getDevices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    // @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.owner', 'owner')
      // .leftJoinAndSelect('device.device_status', 'device_status')
      .skip(skip)
      .take(limit)
      .orderBy('device.created_at', 'DESC');

    // if (status) {
    //   queryBuilder.andWhere('device_status.name = :status', { status });
    // }

    const [devices, total] = await queryBuilder.getManyAndCount();

    return {
      devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System stats retrieved' })
  async getStats() {
    const [totalUsers, activeUsers, totalDevices, activeDevices] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { is_active: true } }),
        this.deviceRepository.count(),
        this.deviceRepository.count({
          where: {
            last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000) as any,
          },
        }),
      ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
      },
    };
  }

  @Get('devices/:deviceId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('devices.read')
  @ApiOperation({ summary: 'Get device details' })
  @ApiResponse({ status: 200, description: 'Device details retrieved' })
  async getDevice(@Param('deviceId') deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['owner', 'device_status'],
    });

    if (!device) {
      throw new Error('Device not found');
    }

    return { device };
  }
}
