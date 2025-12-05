// admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SystemConfig } from '../database/entities/SystemConfig.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { User } from '../database/entities/User.entity';
import { Farm } from '../database/entities/Farm.entity';
import { Device } from '../database/entities/Device.entity';
import { Batch } from '../database/entities/Batch.entity';
import { Payment } from '../database/entities/Payment.entity';
import {
  QueryFarmersDto,
  QueryLogsDto,
  UpdateConfigDto,
} from './dto/admin.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private logger: CustomLogger,
    private auditService: AuditService,
  ) {}

  async getLogs(query: QueryLogsDto) {
    const { entity_type, action, user_id, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .skip(skip)
      .take(limit)
      .orderBy('log.created_at', 'DESC');

    if (entity_type) {
      queryBuilder.andWhere('log.entity_type = :entity_type', { entity_type });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (user_id) {
      queryBuilder.andWhere('log.user_id = :user_id', { user_id });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConfig() {
    const configs = await this.configRepository.find({
      order: { key: 'ASC' },
    });

    // Parse JSON values
    const parsedConfigs = configs.reduce((acc, config) => {
      try {
        acc[config.key] = {
          value: JSON.parse(config.value),
          description: config.description,
          meta: config.meta,
          updated_at: config.updated_at,
        };
      } catch {
        acc[config.key] = {
          value: config.value,
          description: config.description,
          meta: config.meta,
          updated_at: config.updated_at,
        };
      }
      return acc;
    }, {});

    return { config: parsedConfigs };
  }

  async updateConfig(
    updateConfigDto: UpdateConfigDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    let config = await this.configRepository.findOne({
      where: { key: updateConfigDto.key },
    });

    const oldValue = config?.value;

    if (!config) {
      config = this.configRepository.create({
        key: updateConfigDto.key,
        value: updateConfigDto.value,
        meta: updateConfigDto.meta || {},
        updated_by: userId,
      });
    } else {
      config.value = updateConfigDto.value;
      if (updateConfigDto.meta) {
        config.meta = updateConfigDto.meta;
      }
      config.updated_by = userId;
    }

    await this.configRepository.save(config);

    await this.auditService.log(
      userId,
      AuditAction.CONFIG_UPDATED,
      'system_config',
      config.key,
      ipAddress,
      userAgent,
      {
        key: config.key,
        old_value: oldValue,
        new_value: config.value,
      },
    );

    this.logger.log(`System config updated: ${config.key} by user ${userId}`);

    return config;
  }

  async getConfigValue<T = any>(key: string): Promise<T | null> {
    const config = await this.configRepository.findOne({ where: { key } });

    if (!config) {
      return null;
    }

    try {
      return JSON.parse(config.value) as T;
    } catch {
      return config.value as any;
    }
  }

  async getFarmers(query: QueryFarmersDto) {
    // Get farmer user ids (users who own farms)
    const farmerUserIds = await this.farmRepository
      .createQueryBuilder('farm')
      .select('DISTINCT farm.user_id', 'user_id')
      .getRawMany()
      .then((results) => results.map((r) => r.user_id));

    // Start with users query
    const farmersQuery = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.location',
        'user.status',
        // Subqueries for computed fields
        '(SELECT COUNT(*) FROM batchs b WHERE b.user_id = user.id) as batches',
        '(SELECT SUM(b.initial_count) FROM batchs b WHERE b.user_id = user.id) as birds',
        '(SELECT COUNT(*) FROM devices d WHERE d.owner_id = user.id) as brooders',
        "(SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.user_id = user.id AND p.status = 'completed') as revenue",
      ])
      .where('user.id IN (:...farmerIds)', { farmerIds: farmerUserIds });

    // Apply filters from query
    if (query.name) {
      farmersQuery.andWhere('user.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }
    if (query.email) {
      farmersQuery.andWhere('user.email ILIKE :email', {
        email: `%${query.email}%`,
      });
    }
    if (query.location) {
      farmersQuery.andWhere('user.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }
    if (query.status) {
      farmersQuery.andWhere('user.status = :status', { status: query.status });
    }

    // Apply filters for computed fields (min thresholds)
    if (query.batches !== undefined) {
      farmersQuery.andHaving(
        '(SELECT COUNT(*) FROM batchs b WHERE b.user_id = user.id) >= :batches',
        { batches: query.batches },
      );
    }
    if (query.brooders !== undefined) {
      farmersQuery.andHaving(
        '(SELECT COUNT(*) FROM devices d WHERE d.owner_id = user.id) >= :brooders',
        { brooders: query.brooders },
      );
    }
    if (query.birds !== undefined) {
      farmersQuery.andHaving(
        '(SELECT SUM(b.initial_count) FROM batchs b WHERE b.user_id = user.id) >= :birds',
        { birds: query.birds },
      );
    }
    if (query.revenue !== undefined) {
      farmersQuery.andHaving(
        "(SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.user_id = user.id AND p.status = 'completed') >= :revenue",
        { revenue: query.revenue },
      );
    }

    // Add pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    farmersQuery.skip(skip).take(limit);

    const farmers = await farmersQuery.getRawAndEntities();

    // Get total count for pagination
    const totalQuery = this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(DISTINCT user.id)', 'count')
      .where('user.id IN (:...farmerIds)', { farmerIds: farmerUserIds });

    // Apply same filters (without having)
    if (query.name) {
      totalQuery.andWhere('user.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.email) {
      totalQuery.andWhere('user.email ILIKE :email', {
        email: `%${query.email}%`,
      });
    }
    if (query.location) {
      totalQuery.andWhere('user.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }
    if (query.status) {
      totalQuery.andWhere('user.status = :status', { status: query.status });
    }

    if (query.batches !== undefined) {
      totalQuery.andWhere(
        '(SELECT COUNT(*) FROM batchs b WHERE b.user_id = user.id) >= :batches',
      );
    }
    if (query.brooders !== undefined) {
      totalQuery.andWhere(
        '(SELECT COUNT(*) FROM devices d WHERE d.owner_id = user.id) >= :brooders',
      );
    }
    if (query.birds !== undefined) {
      totalQuery.andWhere(
        '(SELECT SUM(b.initial_count) FROM batchs b WHERE b.user_id = user.id) >= :birds',
      );
    }
    if (query.revenue !== undefined) {
      totalQuery.andWhere(
        "(SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.user_id = user.id AND p.status = 'completed') >= :revenue",
      );
    }

    totalQuery.setParameters({
      farmerIds: farmerUserIds,
      name: `%${query.name || ''}%`,
      email: `%${query.email || ''}%`,
      location: `%${query.location || ''}%`,
      status: query.status,
      batches: query.batches,
      brooders: query.brooders,
      birds: query.birds,
      revenue: query.revenue,
    });

    const totalResult = await totalQuery.getRawOne();
    const total = parseInt(totalResult.count, 10);

    // Transform raw results
    const farmerList = farmers.raw.map((raw: any, index: number) => ({
      id: raw.user_id,
      name: raw.user_name,
      email: raw.user_email,
      location: raw.user_location,
      batches: parseInt(raw.batches, 10) || 0,
      brooders: parseInt(raw.brooders, 10) || 0,
      birds: parseInt(raw.birds, 10) || 0,
      revenue: parseFloat(raw.revenue) || 0,
      status: raw.user_status,
    }));

    // Calculate overall totals for all farmers
    const totalFarmers = farmerUserIds.length;
    const totalActiveFarmers = await this.userRepository.count({
      where: { id: In(farmerUserIds), status: 'active' },
    });
    const totalDevicesCount = await this.deviceRepository.count({
      where: { owner_id: In(farmerUserIds) },
    });
    const totalRevenueSum = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.user_id IN (:...userIds)', { userIds: farmerUserIds })
      .andWhere('payment.status = :status', { status: 'completed' })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueSum?.total || '0');

    return {
      farmers: farmerList,
      totalFarmers,
      totalActiveFarmers,
      totalDevices: totalDevicesCount,
      totalRevenue,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
