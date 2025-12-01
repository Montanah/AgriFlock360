// housing/controllers/housing-materials.controller.ts (Admin)
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
import { HousingMaterialsService } from './housing-materials.service';
import { CreateMaterialDto, UpdateMaterialDto, CreateQuantityDto, UpdateQuantityDto, QueryMaterialsDto } from './dto/housing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Housing Materials (Admin)')
@Controller('housing/materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HousingMaterialsController {
  constructor(private readonly materialsService: HousingMaterialsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Create housing material (Admin)' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  async createMaterial(@Body() createDto: CreateMaterialDto) {
    const material = await this.materialsService.createMaterial(createDto);

    return {
      success: true,
      message: 'Material created successfully',
      data: material,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all housing materials' })
  @ApiResponse({ status: 200, description: 'Returns paginated materials' })
  async getMaterials(@Query() query: QueryMaterialsDto) {
    const result = await this.materialsService.getMaterials(query);

    return {
      success: true,
      data: result.materials,
      pagination: result.pagination,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all material categories' })
  @ApiResponse({ status: 200, description: 'Returns list of categories' })
  async getCategories() {
    const categories = await this.materialsService.getCategories();

    return {
      success: true,
      data: categories,
    };
  }

  @Get('capacities')
  @ApiOperation({ summary: 'Get available bird capacities' })
  @ApiResponse({ status: 200, description: 'Returns configured capacities' })
  async getAvailableCapacities() {
    const capacities = await this.materialsService.getAvailableCapacities();

    return {
      success: true,
      data: capacities,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific material' })
  @ApiResponse({ status: 200, description: 'Returns material with quantities' })
  async getMaterial(@Param('id') id: string) {
    const material = await this.materialsService.getMaterial(id);

    return {
      success: true,
      data: material,
    };
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Update material (Admin)' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  async updateMaterial(@Param('id') id: string, @Body() updateDto: UpdateMaterialDto) {
    const material = await this.materialsService.updateMaterial(id, updateDto);

    return {
      success: true,
      message: 'Material updated successfully',
      data: material,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Delete material (Admin)' })
  @ApiResponse({ status: 204, description: 'Material deleted successfully' })
  async deleteMaterial(@Param('id') id: string) {
    await this.materialsService.deleteMaterial(id);
  }

  // Quantities Management

  @Post('quantities')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Add quantity for material (Admin)' })
  @ApiResponse({ status: 201, description: 'Quantity added successfully' })
  async createQuantity(@Body() createDto: CreateQuantityDto) {
    const quantity = await this.materialsService.createQuantity(createDto);

    return {
      success: true,
      message: 'Quantity added successfully',
      data: quantity,
    };
  }

  @Get(':materialId/quantities')
  @ApiOperation({ summary: 'Get quantities for material' })
  @ApiResponse({ status: 200, description: 'Returns quantities by capacity' })
  async getQuantitiesByMaterial(@Param('materialId') materialId: string) {
    const quantities = await this.materialsService.getQuantitiesByMaterial(materialId);

    return {
      success: true,
      data: quantities,
    };
  }

  @Put('quantities/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Update quantity (Admin)' })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully' })
  async updateQuantity(@Param('id') id: string, @Body() updateDto: UpdateQuantityDto) {
    const quantity = await this.materialsService.updateQuantity(id, updateDto);

    return {
      success: true,
      message: 'Quantity updated successfully',
      data: quantity,
    };
  }

  @Delete('quantities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('housing.manage')
  @ApiOperation({ summary: 'Delete quantity (Admin)' })
  @ApiResponse({ status: 204, description: 'Quantity deleted successfully' })
  async deleteQuantity(@Param('id') id: string) {
    await this.materialsService.deleteQuantity(id);
  }

  @Post('seed')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('system.admin')
  @ApiOperation({ summary: 'Seed default housing materials (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Default materials seeded' })
  async seedMaterials() {
    await this.materialsService.seedDefaultMaterials();

    return {
      success: true,
      message: 'Default housing materials seeded successfully',
    };
  }
}

