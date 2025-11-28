//batchs.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { UpdateBatchCountDto } from './dto/update-batch-count.dto';
import { QueryBatchDto } from './dto/query-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('batchs')
@Controller('batchs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new batch' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  async create(
    @Body() createBatchDto: CreateBatchDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.batchService.create(
      createBatchDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user batchs with pagination' })
  @ApiResponse({ status: 200, description: 'Batches retrieved' })
  async findAll(@CurrentUser() user: any, @Query() query: QueryBatchDto) {
    return this.batchService.findAll(user.userId, query);
  }

  @Get(':batchId')
  @ApiOperation({ summary: 'Get batch details with related data' })
  @ApiResponse({ status: 200, description: 'Batch details retrieved' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async findOne(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    return this.batchService.findOne(batchId, user.userId);
  }

  @Patch(':batchId')
  @ApiOperation({ summary: 'Update batch information' })
  @ApiResponse({ status: 200, description: 'Batch updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async update(
    @Param('batchId') batchId: string,
    @Body() updateBatchDto: UpdateBatchDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.batchService.update(
      batchId,
      updateBatchDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':batchId/count')
  @ApiOperation({ summary: 'Update batch count (mortality, sale, etc.)' })
  @ApiResponse({ status: 200, description: 'Batch count updated with history' })
  async updateCount(
    @Param('batchId') batchId: string,
    @Body() updateCountDto: UpdateBatchCountDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.batchService.updateCount(
      batchId,
      updateCountDto,
      user.userId,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':batchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive batch' })
  @ApiResponse({ status: 200, description: 'Batch archived' })
  async archive(
    @Param('batchId') batchId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.batchService.archive(batchId, user.userId, ipAddress, userAgent);
  }

  @Post(':batchId/complete')
  @ApiOperation({ summary: 'Mark batch as completed' })
  @ApiResponse({ status: 200, description: 'Batch completed' })
  async complete(
    @Param('batchId') batchId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.batchService.complete(batchId, user.userId, ipAddress, userAgent);
  }

  @Get(':batchId/stats')
  @ApiOperation({ summary: 'Get batch analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Batch stats retrieved' })
  async getStats(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    return this.batchService.getStats(batchId, user.userId);
  }

  @Get(':batchId/history')
  @ApiOperation({ summary: 'Get batch count history' })
  @ApiResponse({ status: 200, description: 'Batch history retrieved' })
  async getHistory(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    const result = await this.batchService.findOne(batchId, user.userId);
    return { history: result.history };
  }
}