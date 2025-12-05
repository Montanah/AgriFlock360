// inventory/inventory-categories.controller.ts
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
import { InventoryCategoriesService } from './inventory-categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Inventory Categories')
@Controller('inventory/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryCategoriesController {
  constructor(private readonly categoriesService: InventoryCategoriesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('inventory.manage')
  @ApiOperation({ summary: 'Create inventory category (Admin)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() createDto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(createDto);

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async getCategories(@Query('active_only') activeOnly?: string) {
    const categories = await this.categoriesService.getCategories(
      activeOnly === 'true',
    );

    return {
      success: true,
      data: categories,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category details' })
  @ApiResponse({
    status: 200,
    description: 'Returns category with items count',
  })
  async getCategory(@Param('id') id: string) {
    const category = await this.categoriesService.getCategory(id);

    return {
      success: true,
      data: category,
    };
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('inventory.manage')
  @ApiOperation({ summary: 'Update category (Admin)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.updateCategory(id, updateDto);

    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('inventory.manage')
  @ApiOperation({ summary: 'Delete category (Admin)' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.deleteCategory(id);
  }

  @Post('seed')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('system.admin')
  @ApiOperation({ summary: 'Seed default categories (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Categories seeded' })
  async seedCategories() {
    await this.categoriesService.seedDefaultCategories();

    return {
      success: true,
      message: 'Default categories seeded successfully',
    };
  }
}
