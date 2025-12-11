import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/AuditLog.entity';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_INVALIDATED = 'SESSION_INVALIDATED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  DEVICE_CREATED = 'DEVICE_CREATED',
  DEVICE_UPDATED = 'DEVICE_UPDATED',
  DEVICE_PROVISIONED = 'DEVICE_PROVISIONED',
  DEVICE_ASSIGNED = 'DEVICE_ASSIGNED',
  DEVICE_DEACTIVATED = 'DEVICE_DEACTIVATED',
  DEVICE_UNASSIGNED = 'DEVICE_UNASSIGNED',
  DEVICE_DELETED = 'DEVICE_DELETED',
  COMMAND_ISSUED = 'COMMAND_ISSUED',
  BATCH_CREATED = 'BATCH_CREATED',
  BATCH_UPDATED = 'BATCH_UPDATED',
  BATCH_COUNT_UPDATED = 'BATCH_COUNT_UPDATED',
  BATCH_ARCHIVED = 'BATCH_ARCHIVED',
  BATCH_COMPLETED = 'BATCH_COMPLETED',
  PAYG_UNLOCKED = 'PAYG_UNLOCKED',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  CONFIG_UPDATED = 'CONFIG_UPDATED',
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    ipAddress: string,
    userAgent: string,
    meta?: any,
    changes?: any,
  ) {
    const log = this.auditLogRepository.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      user_agent: userAgent,
      meta,
      changes,
    });

    await this.auditLogRepository.save(log);
  }

  async getUserAuditLogs(userId: string, limit = 100) {
    return this.auditLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getSecurityEvents(userId: string) {
    return this.auditLogRepository.find({
      where: {
        user_id: userId,
        action: [
          AuditAction.LOGIN,
          AuditAction.PASSWORD_CHANGE,
          AuditAction.TWO_FA_ENABLED,
          AuditAction.ACCOUNT_LOCKED,
        ] as any,
      },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async getLoginHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: {
        user_id: userId,
        action: AuditAction.LOGIN,
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
      select: [
        'id',
        'action',
        'ip_address',
        'user_agent',
        'meta',
        'created_at',
      ],
    });

    return { logs, total };
  }
}
