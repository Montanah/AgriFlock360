// weight-samples.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeightSample } from '../database/entities/WeightSample.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Weight Samples')
@Controller('batchs/:batchId/weight-samples')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WeightSamplesController {
  constructor(
    @InjectRepository(WeightSample)
    private weightSampleRepository: Repository<WeightSample>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Record weight sample' })
  async create(
    @Param('batchId') batchId: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    const sample = this.weightSampleRepository.create({
      ...data,
      batch_id: batchId,
      recorded_by: user.userId,
    });
    await this.weightSampleRepository.save(sample);
    return sample;
  }

  @Get()
  @ApiOperation({ summary: 'Get weight samples' })
  async findAll(@Param('batchId') batchId: string) {
    const samples = await this.weightSampleRepository.find({
      where: { batch_id: batchId },
      order: { sample_date: 'DESC' },
    });
    return { samples };
  }

  @Get('growth-chart')
  @ApiOperation({ summary: 'Get growth chart data' })
  async getGrowthChart(@Param('batchId') batchId: string) {
    const samples = await this.weightSampleRepository.find({
      where: { batch_id: batchId },
      order: { sample_date: 'ASC' },
    });

    const chartData = samples.map((sample) => ({
      date: sample.sample_date,
      average_weight: Number(sample.average_weight_grams),
      min_weight: Number(sample.min_weight_grams),
      max_weight: Number(sample.max_weight_grams),
    }));

    return { chartData };
  }
}
