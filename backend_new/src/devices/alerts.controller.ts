// devices/alerts.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../database/entities/Alert.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved' })
  async getUserAlerts(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit: number = 50,
  ) {
    const query: any = { user_id: user.userId };
    
    if (status) query.alert_status = status;
    if (severity) query.severity = severity;

    const alerts = await this.alertRepository.find({
      where: query,
      relations: ['device'],
      order: { created_at: 'DESC' },
      take: limit,
    });

    return { alerts };
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get device alerts' })
  @ApiResponse({ status: 200, description: 'Device alerts retrieved' })
  async getDeviceAlerts(
    @Param('deviceId') deviceId: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
  ) {
    const query: any = { device_id: deviceId };
    if (status) query.alert_status = status;

    const alerts = await this.alertRepository.find({
      where: query,
      order: { created_at: 'DESC' },
      take: limit,
    });

    return { alerts };
  }

  @Patch(':alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged' })
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @CurrentUser() user: any,
  ) {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledged_at = new Date();
    alert.acknowledged_by = user.userId;
    alert.alert_status = 'acknowledged';

    await this.alertRepository.save(alert);

    return { alert };
  }

  @Patch(':alertId/resolve')
  @ApiOperation({ summary: 'Resolve alert' })
  @ApiResponse({ status: 200, description: 'Alert resolved' })
  async resolveAlert(@Param('alertId') alertId: string) {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.resolved_at = new Date();
    alert.alert_status = 'resolved';

    await this.alertRepository.save(alert);

    return { alert };
  }
}