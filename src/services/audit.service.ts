import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/Audit-log.entity';

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
}
