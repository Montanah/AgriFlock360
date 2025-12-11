// payments/services/paystack.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../common/custom-logger.service';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly apiUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private logger: CustomLogger,
  ) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }
    this.secretKey = secretKey;
  }

  async initializeTransaction(
    email: string,
    amount: number,
    metadata: any,
    channels: string[] = ['mobile_money', 'card'],
  ) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Paystack expects amount in kobo/cents
          metadata,
          channels,
          callback_url: this.configService.get('PAYSTACK_CALLBACK_URL'),
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Paystack transaction initialized: ${response.data.data.reference}`,
      );

      return {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      this.logger.error(
        `Paystack initialization failed: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Paystack verification failed: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to verify payment');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  async chargeMobileMoney(
    phone: string,
    amount: number,
    email: string,
    metadata: any,
  ) {
    try {
      // First, initialize transaction
      const init = await this.initializeTransaction(email, amount, metadata, [
        'mobile_money',
      ]);

      // For M-Pesa, Paystack will send STK push
      // Customer completes on their phone
      return init;
    } catch (error) {
      this.logger.error(
        `Mobile money charge failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
