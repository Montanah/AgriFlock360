import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOWED_COUNTRIES_KEY } from '../decorators/allowed-countries.decorator';

@Injectable()
export class CountryGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedCountries = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_COUNTRIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedCountries) return true; // No restriction

    const request = context.switchToHttp().getRequest();

    const userCountry =
      request.user?.country || // from JWT
      request.headers['x-country'] || // from frontend header
      request.headers['cf-ipcountry']; // Cloudflare IP detection

    if (!userCountry) throw new ForbiddenException('Country not detected');

    if (!allowedCountries.includes(userCountry))
      throw new ForbiddenException(`Access denied for country: ${userCountry}`);

    return true;
  }
}
