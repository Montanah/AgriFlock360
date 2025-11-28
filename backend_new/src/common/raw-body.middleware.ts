import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    // Store raw body for Stripe/Paystack signature verification
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
      let rawData = '';
      req.on('data', (chunk) => {
        rawData += chunk;
      });
      req.on('end', () => {
        (req as any).rawBody = rawData;
        next();
      });
    } else {
      next();
    }
  }
}
