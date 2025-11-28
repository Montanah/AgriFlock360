// farms.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FarmsService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Farms')
@Controller('farms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new farm' })
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  async create(
    @Body() createFarmDto: CreateFarmDto,
    @CurrentUser() user: any,
  ) {
    return this.farmsService.create(createFarmDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user farms' })
  @ApiResponse({ status: 200, description: 'Farms retrieved' })
  async findAll(@CurrentUser() user: any) {
    return this.farmsService.findAll(user.userId);
  }

  @Get(':farmId')
  @ApiOperation({ summary: 'Get farm details' })
  @ApiResponse({ status: 200, description: 'Farm details retrieved' })
  async findOne(@Param('farmId') farmId: string, @CurrentUser() user: any) {
    return this.farmsService.findOne(farmId, user.userId);
  }

  @Patch(':farmId')
  @ApiOperation({ summary: 'Update farm' })
  @ApiResponse({ status: 200, description: 'Farm updated' })
  async update(
    @Param('farmId') farmId: string,
    @Body() updateData: Partial<CreateFarmDto>,
    @CurrentUser() user: any,
  ) {
    return this.farmsService.update(farmId, updateData, user.userId);
  }

  @Delete(':farmId')
  @ApiOperation({ summary: 'Delete farm' })
  @ApiResponse({ status: 200, description: 'Farm deleted' })
  async remove(@Param('farmId') farmId: string, @CurrentUser() user: any) {
    return this.farmsService.remove(farmId, user.userId);
  }
}

