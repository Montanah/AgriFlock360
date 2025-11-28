// feeding.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FeedingSchedule } from '../database/entities/FeedingSchedule.entity';
import { FeedingRecord } from '../database/entities/FeedingRecord.entity';
import { Batch } from '../database/entities/Batch.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeedingService } from './feeding.service';
import { FeedingRecommendationsService } from './feeding-recommendations.service';
import { CreateFeedingRecordDto } from './dto/feeding.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Feeding')
@Controller('batchs/:batchId/feeding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedingController {
  constructor(
    @InjectRepository(FeedingSchedule)
    private scheduleRepository: Repository<FeedingSchedule>,
    @InjectRepository(FeedingRecord)
    private recordRepository: Repository<FeedingRecord>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private readonly feedingService: FeedingService,
    private readonly recommendationsService: FeedingRecommendationsService,
  ) {}

  @Post('schedules')
  @ApiOperation({ summary: 'Create feeding schedule' })
  async createSchedule(
    @Param('batchId') batchId: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    const schedule = this.scheduleRepository.create({
      ...data,
      batch_id: batchId,
    });
    await this.scheduleRepository.save(schedule);
    return schedule;
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get feeding schedules' })
  async getSchedules(@Param('batchId') batchId: string) {
    const schedules = await this.scheduleRepository.find({
      where: { batch_id: batchId },
      order: { created_at: 'DESC' },
    });
    return { schedules };
  }

  @Get('records')
  @ApiOperation({ summary: 'Get feeding records' })
  async getRecords(
    @Param('batchId') batchId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const query: any = { batch_id: batchId };

    if (start && end) {
      query.fed_at = Between(new Date(start), new Date(end));
    }

    const records = await this.recordRepository.find({
      where: query,
      order: { fed_at: 'DESC' },
      take: 100,
    });

    return { records };
  }

 
  @Get('recommendations')
  @ApiOperation({ summary: 'Get feeding recommendations for batch' })
  @ApiResponse({ status: 200, description: 'Returns recommendations based on batch age and bird type' })
  async getBatchRecommendations(
    @Param('batchId') batchId: string,
    @CurrentUser() user: any,
  ) {
    const recommendations = await this.feedingService.getBatchRecommendations(
      batchId,
      user.userId,
    );

    return {
      success: true,
      data: recommendations,
    };
  }

  @Post('records')
  @ApiOperation({ summary: 'Record feeding for batch' })
  @ApiResponse({ status: 201, description: 'Feeding recorded successfully' })
  async recordFeeding(
    @Param('batchId') batchId: string,
    @Body() createDto: CreateFeedingRecordDto,
    @CurrentUser() user: any,
  ) {
    const record = await this.feedingService.recordFeeding(
      batchId,
      user.userId,
      createDto,
    );

    return {
      success: true,
      message: 'Feeding recorded successfully',
      data: record,
    };
  }

  @Get('records')
  @ApiOperation({ summary: 'Get feeding records for batch' })
  @ApiResponse({ status: 200, description: 'Returns feeding history' })
  async getFeedingRecords(
    @Param('batchId') batchId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @CurrentUser() user: any,
  ) {
    const result = await this.feedingService.getFeedingRecords(
      batchId,
      user.id,
      { start_date: startDate, end_date: endDate, page, limit },
    );

    return {
      success: true,
      data: result.records,
      pagination: result.pagination,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get feeding analytics for batch' })
  @ApiResponse({ status: 200, description: 'Returns feeding statistics' })
  async getFeedingAnalytics(
    @Param('batchId') batchId: string,
    @Query('period') period: string = '7days',
    @CurrentUser() user: any,
  ) {
    const analytics = await this.feedingService.getFeedingAnalytics(
      batchId,
      user.id,
      period,
    );

    return {
      success: true,
      data: analytics,
    };
  }
}
