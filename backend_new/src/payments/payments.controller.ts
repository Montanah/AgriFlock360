// payments/payments.controller.ts
import * as common from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaygService } from './payg.service';
import {
  InitiatePaymentDto,
  PaystackCallbackDto,
  QueryPaymentsDto,
  PaygTopupDto,
  PaygUnlockDto,
} from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Payments')
@common.Controller('payments')
@common.UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paygService: PaygService,
  ) {}

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @common.Post('initiate')
  @ApiOperation({ summary: 'Initiate payment (M-Pesa/Card via Paystack)' })
  @ApiResponse({ status: 201, description: 'Payment initiated' })
  async initiate(
    @common.Body() initiatePaymentDto: InitiatePaymentDto,
    @CurrentUser() user: any,
    @common.Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.paymentsService.initiate(
      initiatePaymentDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @common.Post('callback')
  @Public()
  @common.HttpCode(common.HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook callback' })
  async callback(
    @common.Body() callbackDto: PaystackCallbackDto,
    @common.Headers('x-paystack-signature') signature: string,
    @common.Req() req: common.RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(callbackDto);
    return this.paymentsService.handleCallback(callbackDto, signature, rawBody);
  }

  @common.Get()
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payments retrieved' })
  async findAll(@CurrentUser() user: any, @common.Query() query: QueryPaymentsDto) {
    return this.paymentsService.findAll(user.userId, query);
  }

  @common.Get(':paymentId')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved' })
  async findOne(@common.Param('paymentId') paymentId: string, @CurrentUser() user: any) {
    return this.paymentsService.findOne(paymentId, user.userId);
  }
}
