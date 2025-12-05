// feeding/controllers/feeding-recommendations.controller.ts
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
import { FeedingRecommendationsService } from './feeding-recommendations.service';
import {
  CreateFeedingRecommendationDto,
  UpdateFeedingRecommendationDto,
  QueryRecommendationsDto,
} from './dto/feeding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Feeding Recommendations (Admin)')
@Controller('feeding/recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedingRecommendationsController {
  constructor(
    private readonly recommendationsService: FeedingRecommendationsService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('feeding.manage')
  @ApiOperation({ summary: 'Create feeding recommendation (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Recommendation created successfully',
  })
  async createRecommendation(
    @Body() createDto: CreateFeedingRecommendationDto,
  ) {
    const recommendation =
      await this.recommendationsService.createRecommendation(createDto);

    return {
      success: true,
      message: 'Feeding recommendation created successfully',
      data: recommendation,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all feeding recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated recommendations',
  })
  async getRecommendations(@Query() query: QueryRecommendationsDto) {
    const result = await this.recommendationsService.getRecommendations(query);

    return {
      success: true,
      data: result.recommendations,
      pagination: result.pagination,
    };
  }

  @Get('bird-type/:birdTypeId')
  @ApiOperation({ summary: 'Get recommendations for specific bird type' })
  @ApiResponse({
    status: 200,
    description: 'Returns recommendations for bird type',
  })
  async getRecommendationsByBirdType(@Param('birdTypeId') birdTypeId: string) {
    const recommendations =
      await this.recommendationsService.getRecommendationsByBirdType(
        birdTypeId,
      );

    return {
      success: true,
      data: recommendations,
    };
  }

  @Get('bird-type/:birdTypeId/age/:age')
  @ApiOperation({ summary: 'Get recommendation for specific age' })
  @ApiResponse({
    status: 200,
    description: 'Returns recommendation for the age',
  })
  async getRecommendationForAge(
    @Param('birdTypeId') birdTypeId: string,
    @Param('age') age: number,
  ) {
    const recommendation =
      await this.recommendationsService.getRecommendationForAge(
        birdTypeId,
        +age,
      );

    if (!recommendation) {
      return {
        success: true,
        message: 'No recommendation found for this age',
        data: null,
      };
    }

    return {
      success: true,
      data: recommendation,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific recommendation' })
  @ApiResponse({ status: 200, description: 'Returns recommendation details' })
  async getRecommendation(@Param('id') id: string) {
    const recommendation =
      await this.recommendationsService.getRecommendation(id);

    return {
      success: true,
      data: recommendation,
    };
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('feeding.manage')
  @ApiOperation({ summary: 'Update feeding recommendation (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation updated successfully',
  })
  async updateRecommendation(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeedingRecommendationDto,
  ) {
    const recommendation =
      await this.recommendationsService.updateRecommendation(id, updateDto);

    return {
      success: true,
      message: 'Feeding recommendation updated successfully',
      data: recommendation,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('feeding.manage')
  @ApiOperation({ summary: 'Delete feeding recommendation (Admin)' })
  @ApiResponse({
    status: 204,
    description: 'Recommendation deleted successfully',
  })
  async deleteRecommendation(@Param('id') id: string) {
    await this.recommendationsService.deleteRecommendation(id);
  }

  @Post('seed')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('system.admin')
  @ApiOperation({
    summary: 'Seed default feeding recommendations (Super Admin)',
  })
  @ApiResponse({ status: 200, description: 'Default recommendations seeded' })
  async seedRecommendations() {
    await this.recommendationsService.seedDefaultRecommendations();

    return {
      success: true,
      message: 'Default feeding recommendations seeded successfully',
    };
  }
}
