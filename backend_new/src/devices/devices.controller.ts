// devices/devices.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { CreateCommandDto } from './dto/create-command.dto';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { QueryCommandsDto } from './dto/query-commands.dto';
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

@ApiTags('Devices')
@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Register new device (Admin only)' })
  @ApiResponse({ status: 201, description: 'Device successfully registered' })
  @ApiResponse({ status: 409, description: 'Device ID already exists' })
  async create(
    @Body() createDeviceDto: CreateDeviceDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.create(
      createDeviceDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all devices with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Devices retrieved successfully' })
  async findAll(@Query() query: QueryDevicesDto) {
    return this.devicesService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user devices' })
  @ApiResponse({ status: 200, description: 'User devices retrieved' })
  async findUserDevices(@CurrentUser() user: any) {
    return this.devicesService.findUserDevices(user.userId);
  }

  @Get(':deviceId')
  @ApiOperation({ summary: 'Get device details with telemetry and alerts' })
  @ApiResponse({ status: 200, description: 'Device details retrieved' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findOne(@Param('deviceId') deviceId: string) {
    return this.devicesService.findOne(deviceId);
  }

  @Patch(':deviceId')
  @ApiOperation({ summary: 'Update device information' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async update(
    @Param('deviceId') deviceId: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.update(
      deviceId,
      updateDeviceDto,
      user.userId,
      user.role,
      ipAddress,
      userAgent,
    );
  }

  @Post(':deviceId/provision')
  @ApiOperation({ summary: 'Generate device provisioning credentials' })
  @ApiResponse({
    status: 200,
    description: 'Provisioning credentials generated',
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async provision(
    @Param('deviceId') deviceId: string,
    @Body() provisionDto: ProvisionDeviceDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.provision(
      deviceId,
      provisionDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':deviceId/assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign device to farmer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Device assigned successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async assign(
    @Param('deviceId') deviceId: string,
    @Body() assignDto: AssignDeviceDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.assign(
      deviceId,
      assignDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':deviceId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate device (Admin only)' })
  @ApiResponse({ status: 200, description: 'Device deactivated' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async deactivate(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.deactivate(
      deviceId,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  // ============================================
  // DEVICE COMMANDS
  // ============================================

  @Post(':deviceId/commands')
  @ApiOperation({ summary: 'Send command to device via MQTT' })
  @ApiResponse({ status: 201, description: 'Command queued successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async createCommand(
    @Param('deviceId') deviceId: string,
    @Body() createCommandDto: CreateCommandDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.devicesService.createCommand(
      deviceId,
      createCommandDto,
      user.userId,
      user.role,
      ipAddress,
      userAgent,
    );
  }

  @Get(':deviceId/commands')
  @ApiOperation({ summary: 'Get device command history' })
  @ApiResponse({ status: 200, description: 'Commands retrieved' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getCommands(
    @Param('deviceId') deviceId: string,
    @Query() query: QueryCommandsDto,
  ) {
    return this.devicesService.getCommands(deviceId, query);
  }

  @Get(':deviceId/commands/:commandId')
  @ApiOperation({ summary: 'Get command status' })
  @ApiResponse({ status: 200, description: 'Command details retrieved' })
  @ApiResponse({ status: 404, description: 'Command not found' })
  async getCommand(
    @Param('deviceId') deviceId: string,
    @Param('commandId') commandId: string,
  ) {
    return this.devicesService.getCommand(deviceId, commandId);
  }
}
