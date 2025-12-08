// auth/guards/device-or-user-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, isObservable } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { DeviceAuthGuard } from './device-auth.guard';

/**
 * Guard that allows either device authentication or user JWT authentication
 * Useful for endpoints that can be accessed by both devices and users
 */
@Injectable()
export class DeviceOrUserAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtAuthGuard: JwtAuthGuard,
    private deviceAuthGuard: DeviceAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if device API key is present
    const hasDeviceApiKey = !!request.headers['x-device-api-key'];
    
    // Check if JWT token is present
    const hasJwtToken = !!request.headers['authorization'];

    if (hasDeviceApiKey) {
      // Try device authentication
      try {
        return await this.deviceAuthGuard.canActivate(context);
      } catch (error) {
        // If device auth fails and there's no JWT, throw error
        if (!hasJwtToken) {
          throw error;
        }
        // Otherwise, fall through to JWT auth
      }
    }

    if (hasJwtToken) {
      // Try JWT authentication
      const result = this.jwtAuthGuard.canActivate(context);
      if (typeof result === 'boolean') {
        return result;
      }
      if (result instanceof Promise) {
        return await result;
      }
      return await firstValueFrom(result);
    }

    throw new UnauthorizedException(
      'Authentication required: provide either device API key or user JWT token'
    );
  }
}
