// payments/payg.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaygService } from './payg.service';
import { PaymentsService } from './payments.service';
import { PaygTopupDto, PaygUnlockDto } from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('PAYG')
@Controller('devices/:deviceId/payg')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaygController {
  constructor(
    private readonly paygService: PaygService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('topup')
  @ApiOperation({ summary: 'Top up PAYG balance' })
  async topup(
    @Param('deviceId') deviceId: string,
    @Body() topupDto: PaygTopupDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    // Initiate payment for topup
    return this.paymentsService.initiate(
      {
        device_id: deviceId,
        amount: topupDto.amount,
        payment_method: topupDto.payment_method,
        phone_number: topupDto.phone_number,
        purpose: 'payg_topup' as any,
        currency: 'KES',
      },
      user.userId,
      req.ip || 'unknown',
      req.get('user-agent') || 'unknown',
    );
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get PAYG balance and status' })
  async getBalance(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: any,
  ) {
    return this.paygService.getBalance(deviceId, user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get PAYG transaction history' })
  async getTransactions(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.paygService.getTransactions(deviceId, user.userId, page, limit);
  }

  @Post('unlock')
  @Roles('admin')
  @ApiOperation({ summary: 'Manually unlock device (Admin only)' })
  async unlock(
    @Param('deviceId') deviceId: string,
    @Body() unlockDto: PaygUnlockDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.paygService.unlock(
      deviceId,
      unlockDto.reason,
      user.userId,
      req.ip || 'unknown',
      req.get('user-agent') || 'unknown',
    );
  }
}
