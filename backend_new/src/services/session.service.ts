import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../database/entities/User-session.entity';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {}

  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    refreshToken: string,
  ) {
    const sessionId = crypto.randomUUID();

    const session = this.sessionRepository.create({
      id: sessionId,
      user_id: userId,
      refresh_token_hash: await this.hashToken(refreshToken),
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      last_activity: new Date(),
    });

    await this.sessionRepository.save(session);
    return sessionId;
  }

  async validateSession(
    sessionId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, is_active: true },
    });

    if (!session) return false;

    if (session.expires_at < new Date()) {
      await this.invalidateSession(sessionId);
      return false;
    }

    const isValid = await this.verifyToken(
      refreshToken,
      session.refresh_token_hash,
    );

    if (isValid) {
      // Update last activity
      await this.sessionRepository.update(sessionId, {
        last_activity: new Date(),
      });
    }

    return isValid;
  }

  async invalidateSession(sessionId: string) {
    await this.sessionRepository.update(sessionId, {
      is_active: false,
      invalidated_at: new Date(),
    });
  }

  async invalidateAllUserSessions(userId: string) {
    await this.sessionRepository.update(
      { user_id: userId, is_active: true },
      {
        is_active: false,
        invalidated_at: new Date(),
      },
    );
  }

  async getUserActiveSessions(userId: string) {
    return this.sessionRepository.find({
      where: { user_id: userId, is_active: true },
      order: { last_activity: 'DESC' },
    });
  }

  async cleanupExpiredSessions() {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .orWhere('is_active = false AND invalidated_at < :threshold', {
        threshold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
      })
      .execute();
  }

  private async hashToken(token: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(token, 10);
  }

  private async verifyToken(token: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(token, hash);
  }
}
