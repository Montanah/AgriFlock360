// telemetry/telemetry.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import type { TelemetryData } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post(':deviceId')
  @Public() // Device authentication would be separate
  @ApiOperation({ summary: 'Record device telemetry data' })
  @ApiResponse({ status: 201, description: 'Telemetry recorded' })
  async recordTelemetry(
    @Param('deviceId') deviceId: string,
    @Body() data: TelemetryData,
  ) {
    return this.telemetryService.recordTelemetry(deviceId, data);
  }

  @Get(':deviceId/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest telemetry' })
  @ApiResponse({ status: 200, description: 'Latest telemetry retrieved' })
  async getLatest(@Param('deviceId') deviceId: string) {
    return this.telemetryService.getLatestTelemetry(deviceId);
  }

  @Get(':deviceId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get telemetry history' })
  @ApiResponse({ status: 200, description: 'Telemetry history retrieved' })
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
  async getAggregated(
    @Param('deviceId') deviceId: string,
    @Query('interval') interval: '1h' | '1d' | '1w' = '1d',
  ) {
    return this.telemetryService.getAggregatedTelemetry(deviceId, interval);
  }
}
