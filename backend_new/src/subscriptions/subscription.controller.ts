// subscription.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  TopupBalanceDto,
  RecordUsageDto,
  QuerySubscriptionDto,
  UsageReportDto,
} from './dto/subscriptions.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async create(@Body() dto: CreateSubscriptionDto) {
    return await this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  async findAll(@Query() query: QuerySubscriptionDto) {
    return await this.subscriptionService.findAll(query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get subscriptions by user' })
  async findByUser(@Param('userId') userId: string) {
    return await this.subscriptionService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Returns subscription details' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findOne(@Param('id') id: string) {
    return await this.subscriptionService.findOne(id);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Top up subscription balance (PAYG)' })
  @ApiResponse({ status: 200, description: 'Balance topped up successfully' })
  async topupBalance(@Body() dto: TopupBalanceDto) {
    return await this.subscriptionService.topupBalance(dto);
  }

  @Post('usage')
  @ApiOperation({ summary: 'Record usage (readings, alerts, data)' })
  @ApiResponse({ status: 201, description: 'Usage recorded successfully' })
  async recordUsage(@Body() dto: RecordUsageDto) {
    return await this.subscriptionService.recordUsage(dto);
  }

  @Post('usage-report')
  @ApiOperation({ summary: 'Get usage report for a period' })
  async getUsageReport(@Body() dto: UsageReportDto) {
    return await this.subscriptionService.getUsageReport(dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string; notes?: string },
  ) {
    return await this.subscriptionService.cancel(
      id,
      body.reason,
      body.notes,
    );
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend a subscription' })
  async suspend(@Param('id') id: string) {
    return await this.subscriptionService.suspend(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate a subscription' })
  async reactivate(@Param('id') id: string) {
    return await this.subscriptionService.reactivate(id);
  }
}