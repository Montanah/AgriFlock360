import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as appleSignin from 'apple-signin-auth';

@Injectable()
export class AppleAuthService {
  constructor(private configService: ConfigService) {}

  async verifyToken(idToken: string, userIdentifier: string) {
    try {
      const appleIdTokenClaims = await appleSignin.verifyIdToken(idToken, {
        audience: this.configService.get('APPLE_CLIENT_ID'),
        ignoreExpiration: false,
      });

      return {
        apple_id: appleIdTokenClaims.sub,
        email: appleIdTokenClaims.email,
        email_verified: appleIdTokenClaims.email_verified === 'true',
      };
    } catch (error) {
      throw new Error('Invalid Apple token');
    }
  }

  async getAuthorizationUrl() {
    const options = {
      clientID: this.configService.get('APPLE_CLIENT_ID'),
      redirectUri: this.configService.get('APPLE_CALLBACK_URL'),
      state: randomBytes(16).toString('hex'),
      scope: 'email name',
    };

    return appleSignin.getAuthorizationUrl(options);
  }
}
