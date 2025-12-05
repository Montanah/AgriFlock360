// analytics/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get farmer dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved' })
  async getFarmerSummary(
    @CurrentUser() user: any,
    @Query() query: QueryDashboardDto,
  ) {
    return this.dashboardService.getFarmerSummary(user.userId);
  }

  @Get('admin')
  @Roles('admin')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Admin dashboard retrieved' })
  async getAdminSummary() {
    return this.dashboardService.getAdminSummary();
  }
}
