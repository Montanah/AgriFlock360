// devices/controllers/firmware.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirmwareService } from './firmware.service';
import { CreateFirmwareDto } from './dto/create-firmware.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Firmware')
@Controller('firmware')
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Post('upload')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload new firmware (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        version: { type: 'string' },
        device_type: { type: 'string' },
        description: { type: 'string' },
        changelog: { type: 'string' },
        release_type: { type: 'string', enum: ['stable', 'beta', 'alpha'] },
        is_mandatory: { type: 'boolean' },
      },
    },
  })
  async uploadFirmware(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFirmwareDto: CreateFirmwareDto,
  ) {
    return this.firmwareService.uploadFirmware(file, createFirmwareDto);
  }

  @Patch(':firmwareId/release')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release firmware version (Admin only)' })
  async releaseFirmware(@Param('firmwareId') firmwareId: string) {
    return this.firmwareService.releaseFirmware(firmwareId);
  }

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all firmware versions' })
  async getAllFirmware(@Query('device_type') deviceType?: string) {
    return this.firmwareService.getAllFirmware(deviceType);
  }

  @Get('latest')
  @Public()
  @ApiOperation({ summary: 'Check for firmware update (Device endpoint)' })
  async checkForUpdate(
    @Query('device_type') deviceType: string,
    @Query('current_version') currentVersion: string,
  ) {
    return this.firmwareService.checkForUpdate(deviceType, currentVersion);
  }
}
