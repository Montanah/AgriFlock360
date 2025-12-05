import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { LoginAttempt } from '../database/entities/Login-attempt.entity';
import { User } from '../database/entities/User.entity';

@Injectable()
export class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async recordFailedAttempt(identifier: string, ipAddress: string) {
    await this.loginAttemptRepository.save({
      identifier,
      ip_address: ipAddress,
      success: false,
    });

    const windowStart = new Date(Date.now() - this.ATTEMPT_WINDOW);

    const attempts = await this.loginAttemptRepository.count({
      where: {
        identifier,
        success: false,
        created_at: MoreThanOrEqual(windowStart),
      },
    });

    if (attempts >= this.MAX_ATTEMPTS) {
      await this.lockAccount(identifier);
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutEndsAt: new Date(Date.now() + this.LOCKOUT_DURATION),
      };
    }

    return {
      locked: false,
      remainingAttempts: this.MAX_ATTEMPTS - attempts,
    };
  }

  async recordSuccessfulAttempt(identifier: string, ipAddress: string) {
    await this.loginAttemptRepository.save({
      identifier,
      ip_address: ipAddress,
      success: true,
    });

    // Clear failed attempts
    await this.unlockAccount(identifier);
  }

  async isAccountLocked(identifier: string): Promise<boolean> {
    const user = await this.findUserByIdentifier(identifier);

    if (!user?.locked_until) return false;

    const now = new Date();
    if (user.locked_until > now) {
      return true;
    }

    // Auto-unlock if lockout period expired
    await this.unlockAccount(identifier);
    return false;
  }

  private async lockAccount(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) return;

    await this.userRepository.update(
      { id: user.id },
      {
        locked_until: new Date(Date.now() + this.LOCKOUT_DURATION),
        status: 'inactive',
      },
    );
  }

  private async unlockAccount(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) return;

    await this.userRepository.update(
      { id: user.id },
      {
        locked_until: undefined,
        status: 'active',
      },
    );
  }

  async getRemainingLockoutTime(identifier: string): Promise<number> {
    const user = await this.findUserByIdentifier(identifier);

    if (!user?.locked_until) return 0;

    const remaining = user.locked_until.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // minutes
  }

  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ email: identifier }, { phone_number: identifier }],
      select: ['id', 'locked_until'],
    });
  }
}
