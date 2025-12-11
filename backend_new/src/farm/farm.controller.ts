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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FarmsService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@ApiTags('Farms')
@Controller('farms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new farm' })
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  async create(@Body() createFarmDto: CreateFarmDto, @CurrentUser() user: any) {
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

  @Post(':farmId/photo')
  @ApiOperation({ summary: 'Upload farm avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Farm Avatar uploaded successfully',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(
    @Param('farmId') farmId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const result = await this.farmsService.updateFarmAvatar(
      farmId,
      file,
      user.userId,
    );

    return {
      success: true,
      message: 'Farm avatar updated successfully',
      data: result,
    };
  }

  @Delete(':farmId/photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete farm avatar' })
  @ApiResponse({ status: 204, description: 'Avatar deleted successfully' })
  async deleteAvatar(
    @Param('farmId') farmId: string,
    @CurrentUser() user: any,
  ) {
    await this.farmsService.deleteFarmAvatar(farmId, user.userId);
  }

  @Delete(':farmId')
  @ApiOperation({ summary: 'Delete farm' })
  @ApiResponse({ status: 200, description: 'Farm deleted' })
  async remove(@Param('farmId') farmId: string, @CurrentUser() user: any) {
    return this.farmsService.remove(farmId, user.userId);
  }
}
