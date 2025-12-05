// controllers/subscription-webhook.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { SubscriptionPaymentService } from './subscription-payment.service';
import { SubscriptionService } from './subscription.service';

@ApiTags('Webhooks')
@Controller('webhooks/subscription')
export class SubscriptionWebhookController {
  constructor(
    private readonly paymentService: SubscriptionPaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('payment-callback')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger docs
  async handlePaymentCallback(
    @Body() payload: any,
    @Headers('x-callback-signature') signature: string,
  ) {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      return { status: 'error', message: 'Invalid signature' };
    }

    try {
      // Extract payment details from webhook
      const { transaction_id, amount, phone_number, status, metadata } =
        payload;

      if (status === 'success' && metadata?.subscription_id) {
        // Process the top-up
        await this.subscriptionService.topupBalance({
          subscription_id: metadata.subscription_id,
          amount: parseFloat(amount),
          payment_method: 'mpesa',
          phone_number,
          reference: transaction_id,
        });

        // Check if auto-renewal payment
        if (metadata?.auto_renewal) {
          const subscription = await this.subscriptionService.findOne(
            metadata.subscription_id,
          );
          // Mark subscription as renewed
          // await this.subscriptionService.renewSubscription(subscription);
        }

        return {
          status: 'success',
          message: 'Payment processed successfully',
        };
      }

      return {
        status: 'ignored',
        message: 'Payment not successful or no subscription_id',
      };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implement your signature verification logic
    // Example: HMAC verification
    const crypto = require('crypto');
    const secret = process.env.WEBHOOK_SECRET;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}
