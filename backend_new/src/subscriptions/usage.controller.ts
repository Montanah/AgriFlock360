// usage.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageRecord } from '../database/entities/UsageRecord.entity';

@ApiTags('Usage Records')
@Controller('usage-records')
export class UsageController {
  constructor(
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
  ) {}

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get usage records by subscription' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'usage_type', required: false })
  async getBySubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('usage_type') usageType?: string,
  ) {
    const where: any = { subscription_id: subscriptionId };

    if (startDate && endDate) {
      where.usage_date = Between(new Date(startDate), new Date(endDate));
    }

    if (usageType) {
      where.usage_type = usageType;
    }

    return await this.usageRepo.find({
      where,
      order: { usage_date: 'DESC' },
      take: 100,
    });
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get usage records by device' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  async getByDevice(
    @Param('deviceId') deviceId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const where: any = { device_id: deviceId };

    if (startDate && endDate) {
      where.usage_date = Between(new Date(startDate), new Date(endDate));
    }

    return await this.usageRepo.find({
      where,
      order: { usage_date: 'DESC' },
      take: 100,
    });
  }

  @Get('summary/:subscriptionId')
  @ApiOperation({ summary: 'Get usage summary for subscription' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  async getSummary(
    @Param('subscriptionId') subscriptionId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const where: any = { subscription_id: subscriptionId };

    if (startDate && endDate) {
      where.usage_date = Between(new Date(startDate), new Date(endDate));
    }

    const records = await this.usageRepo.find({ where });

    const summary = {
      total_records: records.length,
      total_cost: 0,
      by_type: {} as Record<string, any>,
      free_usage: 0,
      billed_usage: 0,
    };

    records.forEach((record) => {
      summary.total_cost += Number(record.total_cost);

      if (record.is_free) {
        summary.free_usage += Number(record.total_cost);
      } else {
        summary.billed_usage += Number(record.total_cost);
      }

      if (!summary.by_type[record.usage_type]) {
        summary.by_type[record.usage_type] = {
          count: 0,
          quantity: 0,
          cost: 0,
        };
      }

      summary.by_type[record.usage_type].count++;
      summary.by_type[record.usage_type].quantity += record.quantity;
      summary.by_type[record.usage_type].cost += Number(record.total_cost);
    });

    return summary;
  }
}
