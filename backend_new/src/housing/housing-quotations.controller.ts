// housing/housing-quotations.controller.ts 
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
import { HousingQuotationsService } from './housing-quotations.service';
import { HousingMaterialsService } from './housing-materials.service';
import { GenerateQuotationDto } from './dto/housing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Housing Quotations')
@Controller('housing/quotations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HousingQuotationsController {
  constructor(
    private readonly quotationsService: HousingQuotationsService,
    private readonly materialsService: HousingMaterialsService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate housing cost quotation' })
  @ApiResponse({ status: 201, description: 'Quotation generated successfully' })
  async generateQuotation(
    @Body() generateDto: GenerateQuotationDto,
    @CurrentUser() user: any,
  ) {
    const quotation = await this.quotationsService.generateQuotation(
      user.id,
      generateDto,
    );

    return {
      success: true,
      message: 'Quotation generated successfully',
      data: quotation,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user quotations' })
  @ApiResponse({ status: 200, description: 'Returns user quotations' })
  async getUserQuotations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @CurrentUser() user: any,
  ) {
    const result = await this.quotationsService.getUserQuotations(
      user.id,
      page,
      limit,
    );

    return {
      success: true,
      data: result.quotations,
      pagination: result.pagination,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get quotations summary' })
  @ApiResponse({ status: 200, description: 'Returns summary statistics' })
  async getQuotationSummary(@CurrentUser() user: any) {
    const summary = await this.quotationsService.getQuotationSummary(user.id);

    return {
      success: true,
      data: summary,
    };
  }

  @Get('cost-comparison')
  @ApiOperation({ summary: 'Get cost comparison across capacities' })
  @ApiResponse({ status: 200, description: 'Returns cost comparison' })
  async getCostComparison() {
    const comparison = await this.quotationsService.getCostComparison();

    return {
      success: true,
      data: comparison,
    };
  }

  @Get('preview/:capacity')
  @ApiOperation({ summary: 'Preview costs for specific capacity' })
  @ApiResponse({ status: 200, description: 'Returns cost preview' })
  async previewCosts(@Param('capacity') capacity: number) {
    const quantities = await this.materialsService.getQuantitiesByCapacity(+capacity);

    if (quantities.length === 0) {
      return {
        success: false,
        message: `No data available for ${capacity} bird capacity`,
      };
    }

    const materials = quantities.map(q => ({
      name: q.material.name,
      category: q.material.category,
      unit: q.material.unit,
      unit_price: parseFloat(q.material.unit_price.toString()),
      quantity: parseFloat(q.quantity_needed.toString()),
      total: parseFloat(q.material.unit_price.toString()) * parseFloat(q.quantity_needed.toString()),
      specifications: q.material.specifications,
    }));

    const subtotal = materials.reduce((sum, m) => sum + m.total, 0);
    const labor = (subtotal * 26) / 100;
    const total = subtotal + labor;

    return {
      success: true,
      data: {
        bird_capacity: +capacity,
        materials,
        materials_subtotal: subtotal,
        labor_cost: labor,
        labor_percentage: 26,
        grand_total: total,
        cost_per_bird: total / +capacity,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific quotation' })
  @ApiResponse({ status: 200, description: 'Returns quotation details' })
  async getQuotation(@Param('id') id: string, @CurrentUser() user: any) {
    const quotation = await this.quotationsService.getQuotation(id, user.id);

    return {
      success: true,
      data: quotation,
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update quotation status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    const quotation = await this.quotationsService.updateQuotationStatus(
      id,
      user.id,
      status,
    );

    return {
      success: true,
      message: 'Quotation status updated',
      data: quotation,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quotation' })
  @ApiResponse({ status: 204, description: 'Quotation deleted successfully' })
  async deleteQuotation(@Param('id') id: string, @CurrentUser() user: any) {
    await this.quotationsService.deleteQuotation(id, user.id);
  }
}