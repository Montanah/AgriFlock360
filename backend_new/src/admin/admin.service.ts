// admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../database/entities/SystemConfig.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { QueryLogsDto, UpdateConfigDto } from './dto/admin.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private logger: CustomLogger,
    private auditService: AuditService,
  ) {}

  async getLogs(query: QueryLogsDto) {
    const { entity_type, action, user_id, page =1, limit =10 } = query;
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
}
