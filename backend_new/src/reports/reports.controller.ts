// reports/reports.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('batch/:batchId')
  @ApiOperation({ summary: 'Generate batch report' })
  @ApiResponse({ status: 200, description: 'Batch report generated' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async generateBatchReport(
    @Param('batchId') batchId: string,
    @CurrentUser() user: any,
    @Query() reportDto: GenerateReportDto,
  ) {
    return this.reportsService.generateBatchReport(
      batchId,
      user.userId,
      reportDto,
    );
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Generate device performance report' })
  @ApiResponse({ status: 200, description: 'Device report generated' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async generateDeviceReport(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: any,
    @Query() reportDto: GenerateReportDto,
  ) {
    return this.reportsService.generateDeviceReport(
      deviceId,
      user.userId,
      reportDto,
    );
  }
}






