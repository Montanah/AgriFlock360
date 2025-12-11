import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription-plan.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscriptions.dto';
import { SubscriptionPlan } from '../database/entities/SubscriptionPlan.entity';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: SubscriptionPlan,
  })
  async create(
    @Body() createDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    return await this.subscriptionPlanService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    type: [SubscriptionPlan],
  })
  async findAll(
    @Query('includeInactive') includeInactive: boolean = false,
  ): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanService.findAll(includeInactive);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Public plans retrieved successfully',
    type: [SubscriptionPlan],
  })
  async findPublic(): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanService.findPublic();
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Recommended plans retrieved successfully',
    type: [SubscriptionPlan],
  })
  async getRecommended(): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanService.getRecommendedPlans();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription plan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
    type: SubscriptionPlan,
  })
  async findOne(@Param('id') id: string): Promise<SubscriptionPlan> {
    return await this.subscriptionPlanService.findOne(id);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get subscription plans by type' })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    type: [SubscriptionPlan],
  })
  async findByType(@Param('type') type: string): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanService.findByType(type);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
    type: SubscriptionPlan,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    return await this.subscriptionPlanService.update(id, updateDto);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan activated successfully',
    type: SubscriptionPlan,
  })
  async activate(@Param('id') id: string): Promise<SubscriptionPlan> {
    return await this.subscriptionPlanService.activate(id);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan deactivated successfully',
    type: SubscriptionPlan,
  })
  async deactivate(@Param('id') id: string): Promise<SubscriptionPlan> {
    return await this.subscriptionPlanService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiResponse({ status: 204, description: 'Plan deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.subscriptionPlanService.delete(id);
  }

  @Get(':id/cost-estimate')
  @ApiOperation({ summary: 'Calculate estimated cost for a plan' })
  @ApiQuery({ name: 'devices', required: false, type: Number })
  @ApiQuery({ name: 'readingsPerDay', required: false, type: Number })
  @ApiQuery({ name: 'alertsPerDay', required: false, type: Number })
  @ApiQuery({ name: 'dataKbPerDay', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Cost estimation calculated successfully',
    schema: {
      type: 'object',
      properties: {
        plan: { type: 'object' },
        monthly_estimate: { type: 'number' },
        breakdown: { type: 'object' },
      },
    },
  })
  async calculateCost(
    @Param('id') id: string,
    @Query('devices') devices?: number,
    @Query('readingsPerDay') readingsPerDay?: number,
    @Query('alertsPerDay') alertsPerDay?: number,
    @Query('dataKbPerDay') dataKbPerDay?: number,
  ): Promise<{
    plan: SubscriptionPlan;
    monthly_estimate: number;
    breakdown: any;
  }> {
    return await this.subscriptionPlanService.calculateEstimatedCost(id, {
      devices,
      readings_per_day: readingsPerDay,
      alerts_per_day: alertsPerDay,
      data_kb_per_day: dataKbPerDay,
    });
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get plan statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        plan_name: { type: 'string' },
        total_subscriptions: { type: 'number' },
        active_subscriptions: { type: 'number' },
        total_revenue: { type: 'number' },
        average_monthly_revenue: { type: 'number' },
        by_status: { type: 'object' },
      },
    },
  })
  async getStatistics(@Param('id') id: string) {
    return await this.subscriptionPlanService.getStatistics(id);
  }
}
