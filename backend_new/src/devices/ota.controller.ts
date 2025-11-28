// devices/controllers/ota.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OtaService } from './ota.service';
import { ScheduleOtaDto } from './dto/schedule-ota.dto';
import { OtaProgressDto } from './dto/ota-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('OTA Updates')
@Controller('ota')
export class OtaController {
  constructor(private readonly otaService: OtaService) {}

  @Post('schedule')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule OTA update (Admin only)' })
  async scheduleUpdate(@Body() scheduleOtaDto: ScheduleOtaDto) {
    return this.otaService.scheduleUpdate(scheduleOtaDto);
  }

  @Post('progress')
  @Public()
  @ApiOperation({ summary: 'Update OTA progress (Device endpoint)' })
  async updateProgress(
    @Body() body: { device_id: string; ota_id: string; progress: OtaProgressDto },
  ) {
    return this.otaService.updateProgress(
      body.device_id,
      body.ota_id,
      body.progress,
    );
  }

  @Get('device/:deviceId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device OTA history' })
  async getDeviceHistory(@Param('deviceId') deviceId: string) {
    return this.otaService.getDeviceOtaHistory(deviceId);
  }

  @Get(':otaId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OTA update status' })
  async getOtaStatus(@Param('otaId') otaId: string) {
    return this.otaService.getOtaStatus(otaId);
  }

  @Delete(':otaId/cancel')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel OTA update (Admin only)' })
  async cancelUpdate(@Param('otaId') otaId: string) {
    return this.otaService.cancelUpdate(otaId);
  }

  @Get('stats')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OTA statistics (Admin only)' })
  async getStats() {
    return this.otaService.getOtaStats();
  }
}
