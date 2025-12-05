// vaccine-catalog/vaccine-catalog.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VaccineCatalogService } from './vaccine-catalog.service';
import {
  CreateVaccineDto,
  UpdateVaccineDto,
  QueryVaccinesDto,
} from '../vaccination/dto/vaccination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Vaccine Catalog')
@Controller('vaccine-catalog')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VaccineCatalogController {
  constructor(private readonly vaccineCatalogService: VaccineCatalogService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('vaccines.create')
  @ApiOperation({ summary: 'Create a new vaccine in catalog (Admin only)' })
  @ApiResponse({ status: 201, description: 'Vaccine created successfully' })
  async createVaccine(@Body() createDto: CreateVaccineDto) {
    const vaccine = await this.vaccineCatalogService.createVaccine(createDto);

    return {
      success: true,
      message: 'Vaccine created successfully',
      data: vaccine,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccines from catalog' })
  @ApiResponse({ status: 200, description: 'Returns paginated vaccines' })
  async getVaccines(@Query() query: QueryVaccinesDto) {
    const result = await this.vaccineCatalogService.getVaccines(query);

    return {
      success: true,
      data: result.vaccines,
      pagination: result.pagination,
    };
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended vaccines' })
  @ApiResponse({ status: 200, description: 'Returns recommended vaccines' })
  async getRecommendedVaccines(@Query('bird_type') birdType?: string) {
    const vaccines =
      await this.vaccineCatalogService.getRecommendedVaccines(birdType);

    return {
      success: true,
      data: vaccines,
    };
  }

  @Get('by-age/:age')
  @ApiOperation({ summary: 'Get vaccines appropriate for specific batch age' })
  @ApiResponse({
    status: 200,
    description: 'Returns vaccines suitable for the age',
  })
  async getVaccinesByAge(
    @Param('age') age: number,
    @Query('bird_type') birdType?: string,
  ) {
    const vaccines = await this.vaccineCatalogService.getVaccinesByAge(
      +age,
      birdType,
    );

    return {
      success: true,
      data: vaccines,
      message: `Vaccines suitable for ${age} days old birds`,
    };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all vaccine types' })
  @ApiResponse({ status: 200, description: 'Returns list of vaccine types' })
  async getVaccineTypes() {
    const types = await this.vaccineCatalogService.getVaccineTypes();

    return {
      success: true,
      data: types,
    };
  }

  @Get('diseases')
  @ApiOperation({ summary: 'Get all target diseases' })
  @ApiResponse({ status: 200, description: 'Returns list of diseases' })
  async getTargetDiseases() {
    const diseases = await this.vaccineCatalogService.getTargetDiseases();

    return {
      success: true,
      data: diseases,
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get most used vaccines' })
  @ApiResponse({ status: 200, description: 'Returns popular vaccines' })
  async getPopularVaccines(@Query('limit') limit?: number) {
    const vaccines = await this.vaccineCatalogService.getPopularVaccines(
      limit ? +limit : 10,
    );

    return {
      success: true,
      data: vaccines,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vaccine' })
  @ApiResponse({ status: 200, description: 'Returns vaccine details' })
  async getVaccine(@Param('id') id: string) {
    const vaccine = await this.vaccineCatalogService.getVaccine(id);

    return {
      success: true,
      data: vaccine,
    };
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('vaccines.update')
  @ApiOperation({ summary: 'Update a vaccine (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vaccine updated successfully' })
  async updateVaccine(
    @Param('id') id: string,
    @Body() updateDto: UpdateVaccineDto,
  ) {
    const vaccine = await this.vaccineCatalogService.updateVaccine(
      id,
      updateDto,
    );

    return {
      success: true,
      message: 'Vaccine updated successfully',
      data: vaccine,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('vaccines.delete')
  @ApiOperation({ summary: 'Delete a vaccine (Admin only)' })
  @ApiResponse({ status: 204, description: 'Vaccine deleted successfully' })
  async deleteVaccine(@Param('id') id: string) {
    await this.vaccineCatalogService.deleteVaccine(id);
  }

  @Post('seed')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('system.admin')
  @ApiOperation({ summary: 'Seed common vaccines (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Common vaccines seeded' })
  async seedVaccines() {
    await this.vaccineCatalogService.seedCommonVaccines();

    return {
      success: true,
      message: 'Common vaccines seeded successfully',
    };
  }
}
