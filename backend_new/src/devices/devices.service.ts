
// devices/devices.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../database/entities/Device.entity';
import { DeviceStatus } from '../database/entities/DeviceStatus.entity';
import { IssuedDeviceCommand } from '../database/entities/IssuedDeviceCommand.entity';
import { CommandType } from '../database/entities/CommandType.entity';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { Alert } from '../database/entities/Alert.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { CreateCommandDto } from './dto/create-command.dto';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { QueryCommandsDto } from './dto/query-commands.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';
import { MqttService } from '../mqtt/mqtt.service';
import * as crypto from 'crypto';
import { RedisCacheService } from 'src/common/redis/redis-cache.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(DeviceStatus)
    private deviceStatusRepository: Repository<DeviceStatus>,
    @InjectRepository(IssuedDeviceCommand)
    private commandRepository: Repository<IssuedDeviceCommand>,
    @InjectRepository(CommandType)
    private commandTypeRepository: Repository<CommandType>,
    @InjectRepository(Telemetry)
    private telemetryRepository: Repository<Telemetry>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private logger: CustomLogger,
    private auditService: AuditService,
    private redisCache: RedisCacheService,
    private mqttService: MqttService,
  ) {}

  async create(
    createDeviceDto: CreateDeviceDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // Check if device_id already exists
    const existingDevice = await this.deviceRepository.findOne({
      where: { device_id: createDeviceDto.device_id },
    });

    if (existingDevice) {
      throw new ConflictException('Device ID already registered');
    }

    // Get default device status
    const defaultStatus = await this.deviceStatusRepository.findOne({
      where: { name: 'registered' },
    });

    if (!defaultStatus) {
      throw new BadRequestException('Default device status not found');
    }

    const device = this.deviceRepository.create({
      ...createDeviceDto,
      device_status_id: defaultStatus.id,
      mqtt_topic_prefix: `devices/${createDeviceDto.device_id}`,
    });

    await this.deviceRepository.save(device);

    await this.auditService.log(
      userId,
      AuditAction.DEVICE_CREATED,
      'device',
      device.id,
      ipAddress,
      userAgent,
      { device_id: device.device_id },
    );

    this.logger.log(`Device created: ${device.device_id} by user ${userId}`);

    return device;
  }

  async findAll(query: QueryDevicesDto) {
    const { status, owner_id, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.device_status', 'status')
      .leftJoinAndSelect('device.owner', 'owner')
      .skip(skip)
      .take(limit)
      .orderBy('device.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('status.name = :status', { status });
    }

    if (owner_id) {
      queryBuilder.andWhere('device.owner_id = :owner_id', { owner_id });
    }

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

  async findOne(deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['device_status', 'owner'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Get latest telemetry
    const latestTelemetry = await this.telemetryRepository.findOne({
      where: { device_id: deviceId },
      order: { timestamp: 'DESC' },
    });

    // Get active alerts
    const activeAlerts = await this.alertRepository.find({
      where: {
        device_id: deviceId,
        alert_status: 'active',
      },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      device,
      latest_telemetry: latestTelemetry,
      active_alerts: activeAlerts,
    };
  }

  async findUserDevices(userId: string) {
    const devices = await this.deviceRepository.find({
      where: { owner_id: userId },
      relations: ['device_status'],
      order: { created_at: 'DESC' },
    });

    return { devices };
  }

  async update(
    deviceId: string,
    updateDeviceDto: UpdateDeviceDto,
    userId: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check permissions
    if (userRole !== 'admin' && device.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to update this device');
    }

    Object.assign(device, updateDeviceDto);
    await this.deviceRepository.save(device);

    await this.auditService.log(
      userId,
      AuditAction.DEVICE_UPDATED,
      'device',
      device.id,
      ipAddress,
      userAgent,
      { changes: updateDeviceDto },
    );

    this.logger.log(`Device updated: ${device.device_id} by user ${userId}`);

    return device;
  }

  async provision(
    deviceId: string,
    provisionDto: ProvisionDeviceDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Generate provisioning token (valid for 24 hours)
    const provisioningToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update device with WiFi settings
    device.wifi_ssid = provisionDto.wifi_ssid;
    await this.deviceRepository.save(device);

    // Store provisioning token (in production, use Redis or separate table)
    // For now, we'll return it directly

    await this.auditService.log(
      userId,
      AuditAction.DEVICE_PROVISIONED,
      'device',
      device.id,
      ipAddress,
      userAgent,
      { wifi_ssid: provisionDto.wifi_ssid },
    );

    this.logger.log(`Device provisioned: ${device.device_id}`);

    return {
      success: true,
      provisioning_token: provisioningToken,
      expires_at: expiresAt,
      mqtt_config: {
        broker: provisionDto.mqtt_config?.broker || process.env.MQTT_BROKER,
        port: provisionDto.mqtt_config?.port || 1883,
        topic_prefix: device.mqtt_topic_prefix,
        device_id: device.device_id,
      },
    };
  }

  async assign(
    deviceId: string,
    assignDto: AssignDeviceDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const previousOwnerId = device.owner_id;
    device.owner_id = assignDto.owner_id;
    await this.deviceRepository.save(device);

    await this.auditService.log(
      userId,
      AuditAction.DEVICE_ASSIGNED,
      'device',
      device.id,
      ipAddress,
      userAgent,
      {
        previous_owner: previousOwnerId,
        new_owner: assignDto.owner_id,
      },
    );

    this.logger.log(
      `Device ${device.device_id} assigned to user ${assignDto.owner_id}`,
    );

    return device;
  }

  async deactivate(
    deviceId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Get deactivated status
    const deactivatedStatus = await this.deviceStatusRepository.findOne({
      where: { name: 'deactivated' },
    });

    if (deactivatedStatus) {
      device.device_status_id = deactivatedStatus.id;
      await this.deviceRepository.save(device);
    }

    await this.auditService.log(
      userId,
      AuditAction.DEVICE_DEACTIVATED,
      'device',
      device.id,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Device deactivated: ${device.device_id}`);

    return { success: true };
  }

  async createCommand(
    deviceId: string,
    createCommandDto: CreateCommandDto,
    userId: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check permissions
    if (userRole !== 'admin' && device.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to control this device');
    }

    // Get command type
    const commandType = await this.commandTypeRepository.findOne({
      where: { name: createCommandDto.command_type },
    });

    if (!commandType) {
      throw new BadRequestException('Invalid command type');
    }

    // Validate payload based on command type
    this.validateCommandPayload(createCommandDto.command_type, createCommandDto.payload);

    const expiresAt = createCommandDto.expires_in
      ? new Date(Date.now() + createCommandDto.expires_in * 1000)
      : new Date(Date.now() + 300000); // 5 minutes default

    const command = this.commandRepository.create({
      device_id: deviceId,
      issued_by: userId,
      command_type_id: commandType.id,
      payload: createCommandDto.payload,
      command_status: 'pending',
      expires_at: expiresAt,
    });

    await this.commandRepository.save(command);

    // Queue command in Redis
    await this.redisCache.queueCommand(deviceId, {
      command_id: command.id,
      type: createCommandDto.command_type,
      payload: createCommandDto.payload,
      expires_at: expiresAt,
    });

    // Set command status in Redis
    await this.redisCache.setCommandStatus(command.id, 'pending', {
      device_id: deviceId,
      created_at: new Date().toISOString(),
    });

    await this.auditService.log(
      userId,
      AuditAction.COMMAND_ISSUED,
      'command',
      command.id,
      ipAddress,
      userAgent,
      {
        device_id: deviceId,
        command_type: createCommandDto.command_type,
      },
    );

    this.logger.log(
      `Command issued: ${createCommandDto.command_type} for device ${device.device_id}`,
    );

    // Publish to MQTT
    await this.mqttService.publish(
      `${device.mqtt_topic_prefix}/commands`,
      command
    );

    return {
      command_id: command.id,
      status: command.command_status,
      expires_at: command.expires_at,
    };
  }

  async getCommands(deviceId: string, query: QueryCommandsDto) {
    const { status, limit } = query;

    const queryBuilder = this.commandRepository
      .createQueryBuilder('command')
      .leftJoinAndSelect('command.command_type', 'commandType')
      .leftJoinAndSelect('command.issued_by_user', 'issuer')
      .where('command.device_id = :deviceId', { deviceId })
      .orderBy('command.created_at', 'DESC')
      .take(limit);

    if (status) {
      queryBuilder.andWhere('command.command_status = :status', { status });
    }

    const commands = await queryBuilder.getMany();

    return { commands };
  }

  async getCommand(deviceId: string, commandId: string) {
    const command = await this.commandRepository.findOne({
      where: {
        id: commandId,
        device_id: deviceId,
      },
      relations: ['command_type', 'issued_by_user'],
    });

    if (!command) {
      throw new NotFoundException('Command not found');
    }

    return { command };
  }

  private validateCommandPayload(commandType: string, payload: any) {
    switch (commandType) {
      case 'set_temperature':
        if (!payload.target_temp || payload.target_temp < 0 || payload.target_temp > 50) {
          throw new BadRequestException('Invalid target temperature (0-50°C)');
        }
        break;
      case 'toggle_heater':
      case 'toggle_fan':
        if (typeof payload.state !== 'boolean') {
          throw new BadRequestException('State must be a boolean');
        }
        break;
      case 'set_auto_mode':
        if (typeof payload.enabled !== 'boolean') {
          throw new BadRequestException('Enabled must be a boolean');
        }
        break;
      
    }
  }
}
