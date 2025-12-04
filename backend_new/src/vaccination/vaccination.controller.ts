// vaccinations/vaccinations.controller.ts (UPDATED)
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto } from './dto/vaccination.dto';
import { CompleteVaccinationDto } from './dto/vaccination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Vaccinations')
@Controller('batches/:batchId/vaccinations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule vaccination for batch (from catalog or manual)' })
  @ApiResponse({ status: 201, description: 'Vaccination scheduled' })
  async create(
    @Param('batchId') batchId: string,
    @Body() createVaccinationDto: CreateVaccinationDto,
    @CurrentUser() user: any,
  ) {
    const vaccination = await this.vaccinationsService.create(
      batchId,
      createVaccinationDto,
      user.userId,
    );

    return {
      success: true,
      message: 'Vaccination scheduled successfully',
      data: vaccination,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all batch vaccinations with summary' })
  @ApiResponse({ status: 200, description: 'Vaccinations retrieved' })
  async findAll(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    const result = await this.vaccinationsService.findAll(batchId, user.userId);

    return {
      success: true,
      data: result.vaccinations,
      summary: result.summary,
    };
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get recommended vaccines for this batch based on age' })
  @ApiResponse({ status: 200, description: 'Recommended vaccines retrieved' })
  async getRecommendations(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    const result = await this.vaccinationsService.getRecommendedVaccines(batchId, user.userId);

    return {
      success: true,
      data: result.recommended_vaccines,
      meta: {
        batch_age_days: result.batch_age_days,
        scheduled_count: result.scheduled_count,
      },
    };
  }

  @Get(':vaccinationId')
  @ApiOperation({ summary: 'Get specific vaccination details' })
  @ApiResponse({ status: 200, description: 'Vaccination details retrieved' })
  async findOne(
    @Param('vaccinationId') vaccinationId: string,
    @CurrentUser() user: any,
  ) {
    const vaccination = await this.vaccinationsService.findOne(vaccinationId, user.userId);

    return {
      success: true,
      data: vaccination,
    };
  }

  @Patch(':vaccinationId/complete')
  @ApiOperation({ summary: 'Mark vaccination as completed' })
  @ApiResponse({ status: 200, description: 'Vaccination completed' })
  async complete(
    @Param('vaccinationId') vaccinationId: string,
    @Body() completeDto: CompleteVaccinationDto,
    @CurrentUser() user: any,
  ) {
    const vaccination = await this.vaccinationsService.complete(
      vaccinationId,
      user.userId,
      completeDto,
    );

    return {
      success: true,
      message: 'Vaccination marked as completed',
      data: vaccination,
    };
  }

  @Put(':vaccinationId')
  @ApiOperation({ summary: 'Update scheduled vaccination' })
  @ApiResponse({ status: 200, description: 'Vaccination updated' })
  async update(
    @Param('vaccinationId') vaccinationId: string,
    @Body() updateDto: Partial<CreateVaccinationDto>,
    @CurrentUser() user: any,
  ) {
    const vaccination = await this.vaccinationsService.updateVaccination(
      vaccinationId,
      user.userId,
      updateDto,
    );

    return {
      success: true,
      message: 'Vaccination updated successfully',
      data: vaccination,
    };
  }

  @Patch(':vaccinationId/cancel')
  @ApiOperation({ summary: 'Cancel scheduled vaccination' })
  @ApiResponse({ status: 200, description: 'Vaccination cancelled' })
  async cancel(
    @Param('vaccinationId') vaccinationId: string,
    @CurrentUser() user: any,
  ) {
    const vaccination = await this.vaccinationsService.cancelVaccination(
      vaccinationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Vaccination cancelled',
      data: vaccination,
    };
  }

  @Delete(':vaccinationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete vaccination record' })
  @ApiResponse({ status: 204, description: 'Vaccination deleted' })
  async delete(
    @Param('vaccinationId') vaccinationId: string,
    @CurrentUser() user: any,
  ) {
    await this.vaccinationsService.deleteVaccination(vaccinationId, user.userId);
  }
}