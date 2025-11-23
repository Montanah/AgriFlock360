
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TokenRotationService {
  private readonly usedTokens = new Set<string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async rotateRefreshToken(oldRefreshToken: string, userId: string) {
    // Verify old token hasn't been used
    const tokenHash = crypto
      .createHash('sha256')
      .update(oldRefreshToken)
      .digest('hex');

    if (this.usedTokens.has(tokenHash)) {
      throw new Error('Token reuse detected - possible security breach');
    }

    // Mark old token as used
    this.usedTokens.add(tokenHash);

    // Generate new tokens
    const payload = { sub: userId };
    
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
      jwtid: crypto.randomUUID(),
    });

    // Cleanup old used tokens (keep last 1000)
    if (this.usedTokens.size > 1000) {
      const tokensArray = Array.from(this.usedTokens);
      tokensArray.slice(0, 500).forEach(token => this.usedTokens.delete(token));
    }

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
