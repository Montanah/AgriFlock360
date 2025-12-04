// controllers/field-appraisal.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FieldAppraisalService } from './field-appraisal.service';
import {
  CreateFieldAppraisalDto,
  UpdateFieldAppraisalDto,
  QueryFieldAppraisalDto,
} from './dto/create-field-appraisal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Field Appraisals')
@Controller('field-appraisals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FieldAppraisalController {
  constructor(
    private readonly appraisalService: FieldAppraisalService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new field appraisal' })
  @ApiResponse({
    status: 201,
    description: 'Appraisal created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() dto: CreateFieldAppraisalDto) {
    return await this.appraisalService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all field appraisals' })
  @ApiResponse({ status: 200, description: 'Returns list of appraisals' })
  async findAll(@Query() query: QueryFieldAppraisalDto) {
    return await this.appraisalService.findAll(query);
  }

  @Get('fraud-flagged')
  @ApiOperation({ summary: 'Get all fraud-flagged appraisals' })
  @ApiResponse({
    status: 200,
    description: 'Returns appraisals with fraud flags',
  })
  async getFraudFlagged() {
    return await this.appraisalService.getFraudFlagged();
  }

  @Get('follow-ups')
  @ApiOperation({ summary: 'Get upcoming follow-up appraisals' })
  @ApiResponse({
    status: 200,
    description: 'Returns appraisals requiring follow-up',
  })
  async getUpcomingFollowUps() {
    return await this.appraisalService.getUpcomingFollowUps();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get appraisal statistics' })
  @ApiQuery({
    name: 'officer_id',
    required: false,
    description: 'Filter by officer ID',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date for statistics',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date for statistics',
  })
  async getStatistics(
    @Query('officer_id') officerId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return await this.appraisalService.getStatistics(
      officerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('officer/:officerId')
  @ApiOperation({ summary: 'Get appraisals by officer' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Filter from date',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Filter to date',
  })
  async getByOfficer(
    @Param('officerId') officerId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return await this.appraisalService.getAppraisalsByOfficer(
      officerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('farmer/:farmerId')
  @ApiOperation({ summary: 'Get appraisals by farmer' })
  async getByFarmer(@Param('farmerId') farmerId: string) {
    return await this.appraisalService.getAppraisalsByFarmer(farmerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get field appraisal by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns appraisal details',
  })
  @ApiResponse({ status: 404, description: 'Appraisal not found' })
  async findOne(@Param('id') id: string) {
    return await this.appraisalService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update field appraisal' })
  @ApiResponse({
    status: 200,
    description: 'Appraisal updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Appraisal not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFieldAppraisalDto,
  ) {
    return await this.appraisalService.update(id, dto);
  }

  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Add farmer feedback to appraisal' })
  @ApiResponse({
    status: 200,
    description: 'Feedback added successfully',
  })
  async addFeedback(
    @Param('id') id: string,
    @Body() body: { rating: number; feedback: string },
  ) {
    return await this.appraisalService.addFarmerFeedback(
      id,
      body.rating,
      body.feedback,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete field appraisal' })
  @ApiResponse({
    status: 204,
    description: 'Appraisal deleted successfully',
  })
  async delete(@Param('id') id: string) {
    await this.appraisalService.delete(id);
  }
}