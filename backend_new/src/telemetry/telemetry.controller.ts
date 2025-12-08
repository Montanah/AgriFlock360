// telemetry/telemetry.controller.ts
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
import { TelemetryService } from './telemetry.service';
import type { TelemetryData } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceAuthGuard } from '../auth/guards/device-auth.guard';
import { DeviceOrUserAuthGuard } from '../auth/guards/device-or-user-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post(':deviceId')
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Record device telemetry data' })
  @ApiHeader({
    name: 'x-device-api-key',
    description: 'Device API key for authentication',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Telemetry recorded' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async recordTelemetry(
    @Param('deviceId') deviceId: string,
    @Body() data: TelemetryData,
    @Req() req: any,
  ) {
    return this.telemetryService.recordTelemetry(deviceId, data);
  }

  @Get(':deviceId/latest')
  @UseGuards(DeviceOrUserAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-device-api-key',
    description: 'Device API key (alternative to JWT)',
    required: false,
  })
  @ApiOperation({ summary: 'Get latest telemetry' })
  @ApiResponse({ status: 200, description: 'Latest telemetry retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLatest(@Param('deviceId') deviceId: string) {
    return this.telemetryService.getLatestTelemetry(deviceId);
  }

  @Get(':deviceId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get telemetry history' })
  @ApiResponse({ status: 200, description: 'Telemetry history retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(
    @Param('deviceId') deviceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit: number = 100,
  ) {
    const startDate = start
      ? new Date(start)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date();

    return this.telemetryService.getTelemetryHistory(
      deviceId,
      startDate,
      endDate,
      limit,
    );
  }

  @Get(':deviceId/aggregated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated telemetry data' })
  @ApiResponse({ status: 200, description: 'Aggregated data retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAggregated(
    @Param('deviceId') deviceId: string,
    @Query('interval') interval: '1h' | '1d' | '1w' = '1d',
  ) {
    return this.telemetryService.getAggregatedTelemetry(deviceId, interval);
  }
}
