// reports/reports.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Batch } from '../database/entities/Batch.entity';
import { Device } from '../database/entities/Device.entity';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { BatchHistory } from '../database/entities/BatchHistory.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { GenerateReportDto, ReportFormat } from './dto/reports.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(BatchHistory)
    private batchHistoryRepository: Repository<BatchHistory>,
    @InjectRepository(Vaccination)
    private vaccinationRepository: Repository<Vaccination>,
    @InjectRepository(FeedingRecord)
    private feedingRecordRepository: Repository<FeedingRecord>,
    @InjectRepository(WeightSample)
    private weightSampleRepository: Repository<WeightSample>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Telemetry)
    private telemetryRepository: Repository<Telemetry>,
    private logger: CustomLogger,
  ) {}

  async generateBatchReport(
    batchId: string,
    userId: string,
    reportDto: GenerateReportDto,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: ['user', 'device', 'farm'],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const startDate = reportDto.from
      ? new Date(reportDto.from)
      : batch.start_date;
    const endDate = reportDto.to ? new Date(reportDto.to) : new Date();

    // Gather all batch data
    const [history, vaccinations, feedingRecords, weightSamples] =
      await Promise.all([
        this.batchHistoryRepository.find({
          where: {
            batch_id: batchId,
            created_at: Between(startDate, endDate) as any,
          },
          order: { created_at: 'ASC' },
        }),

        this.vaccinationRepository.find({
          where: { batch_id: batchId },
          order: { scheduled_date: 'ASC' },
        }),

        this.feedingRecordRepository.find({
          where: {
            batch_id: batchId,
            fed_at: Between(startDate, endDate) as any,
          },
          order: { fed_at: 'ASC' },
        }),

        this.weightSampleRepository.find({
          where: { batch_id: batchId },
          order: { sample_date: 'ASC' },
        }),
      ]);

    // Calculate statistics
    const totalMortality = history
      .filter((h) => h.change_type === 'mortality')
      .reduce((sum, h) => sum + h.change_amount, 0);

    const totalFeedConsumed = feedingRecords.reduce(
      (sum, r) => sum + Number(r.quantity),
      0,
    );

    const totalFeedCost = feedingRecords.reduce(
      (sum, r) => sum + (Number(r.cost) || 0),
      0,
    );

    const mortalityRate =
      ((totalMortality / batch.initial_count) * 100).toFixed(2) + '%';

    const avgDailyGrowth =
      weightSamples.length > 1
        ? (
            (Number(
              weightSamples[weightSamples.length - 1].average_weight_grams,
            ) -
              Number(weightSamples[0].average_weight_grams)) /
            weightSamples.length
          ).toFixed(2)
        : '0';

    const reportData = {
      batch: {
        name: batch.batch_name,
        breed: batch.breed,
        bird_type: batch.bird_type,
        initial_count: batch.initial_count,
        current_count: batch.current_count,
        start_date: batch.start_date,
        status: batch.current_status,
      },
      period: {
        from: startDate,
        to: endDate,
      },
      summary: {
        total_mortality: totalMortality,
        mortality_rate: mortalityRate,
        total_feed_consumed_kg: totalFeedConsumed,
        total_feed_cost: totalFeedCost,
        avg_daily_growth_grams: avgDailyGrowth,
        vaccinations_completed: vaccinations.filter(
          (v) => v.vaccination_status === 'completed',
        ).length,
        vaccinations_total: vaccinations.length,
      },
      history,
      vaccinations,
      feeding_records: feedingRecords,
      weight_samples: weightSamples,
      generated_at: new Date(),
    };

    // Handle different formats
    if (reportDto.format === ReportFormat.JSON) {
      return reportData;
    }

    // For PDF/Excel, you would use libraries like pdfkit or exceljs
    // Placeholder for now
    const format = reportDto.format ?? ReportFormat.JSON;
    this.logger.log(
      `Report generated for batch ${batchId} in ${format} format`,
    );

    return {
      message: `${format.toUpperCase()} generation not yet implemented`,
      report_data: reportData,
    };
  }

  async generateDeviceReport(
    deviceId: string,
    userId: string,
    reportDto: GenerateReportDto,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['owner', 'device_status'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.owner_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const startDate = reportDto.from
      ? new Date(reportDto.from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = reportDto.to ? new Date(reportDto.to) : new Date();

    // Get telemetry data
    const telemetry = await this.telemetryRepository.find({
      where: {
        device_id: deviceId,
        timestamp: Between(startDate, endDate) as any,
      },
      order: { timestamp: 'ASC' },
    });

    // Calculate statistics
    const avgTemperature =
      telemetry.length > 0
        ? (
            telemetry.reduce((sum, t) => sum + Number(t.temperature || 0), 0) /
            telemetry.length
          ).toFixed(2)
        : '0';

    const avgHumidity =
      telemetry.length > 0
        ? (
            telemetry.reduce((sum, t) => sum + Number(t.humidity || 0), 0) /
            telemetry.length
          ).toFixed(2)
        : '0';

    const uptimePercentage =
      telemetry.length > 0
        ? (
            (telemetry.filter((t) => t.power_status).length /
              telemetry.length) *
            100
          ).toFixed(2)
        : '0';

    const reportData = {
      device: {
        device_id: device.device_id,
        device_name: device.device_name,
        firmware_version: device.firmware_version,
        status: device.device_status?.name,
      },
      period: {
        from: startDate,
        to: endDate,
      },
      summary: {
        data_points: telemetry.length,
        avg_temperature: avgTemperature,
        avg_humidity: avgHumidity,
        uptime_percentage: uptimePercentage,
      },
      telemetry,
      generated_at: new Date(),
    };

    if (reportDto.format === ReportFormat.JSON) {
      return reportData;
    }

    // For PDF/Excel, you would use libraries like pdfkit or exceljs
    // Placeholder for now
    const format = reportDto.format ?? ReportFormat.JSON;
    this.logger.log(
      `Report generated for device ${deviceId} in ${format} format`,
    );

    return {
      message: `${format.toUpperCase()} generation not yet implemented`,
      report_data: reportData,
    };
  }
}
