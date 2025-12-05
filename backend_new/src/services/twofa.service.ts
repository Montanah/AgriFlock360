import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../database/entities/User.entity';
import { TwoFactorAuth } from '../database/entities/Two-factor-auth.entity';

@Injectable()
export class TwoFAService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TwoFactorAuth)
    private twoFARepository: Repository<TwoFactorAuth>,
  ) {}

  async generateSecret(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `AgriFlock360 (${user.email})`,
      issuer: 'AgriFlock360',
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate OTP authentication URL');
    }

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Store temporarily
    let twoFA = await this.twoFARepository.findOne({
      where: { user_id: userId },
    });

    if (!twoFA) {
      twoFA = this.twoFARepository.create({
        user_id: userId,
        secret: secret.base32,
        is_enabled: false,
      });
    } else {
      twoFA.secret = secret.base32;
    }

    await this.twoFARepository.save(twoFA);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async enable2FA(userId: string, token: string) {
    const twoFA = await this.twoFARepository.findOne({
      where: { user_id: userId },
    });

    if (!twoFA) {
      throw new Error('2FA not initialized');
    }

    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('Invalid 2FA token');
    }

    twoFA.is_enabled = true;
    await this.twoFARepository.save(twoFA);

    await this.userRepository.update(userId, { is_2fa_enabled: true });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    twoFA.backup_codes = backupCodes;
    await this.twoFARepository.save(twoFA);

    return { success: true, backupCodes };
  }

  async disable2FA(userId: string, token: string) {
    const twoFA = await this.twoFARepository.findOne({
      where: { user_id: userId },
    });

    if (!twoFA) {
      throw new Error('2FA not initialized');
    }

    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('Invalid 2FA token');
    }

    await this.twoFARepository.delete({ user_id: userId });
    await this.userRepository.update(userId, { is_2fa_enabled: false });

    return { success: true };
  }

  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const twoFA = await this.twoFARepository.findOne({
      where: { user_id: userId },
    });

    if (!twoFA || !twoFA.is_enabled) {
      return true; // 2FA not enabled
    }

    // Check backup codes first
    if (twoFA.backup_codes?.includes(token)) {
      // Remove used backup code
      twoFA.backup_codes = twoFA.backup_codes.filter((code) => code !== token);
      await this.twoFARepository.save(twoFA);
      return true;
    }

    return speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}
