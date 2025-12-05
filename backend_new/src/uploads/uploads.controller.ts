// uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { QueryUploadsDto } from './dto/query-uploads.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as multer from 'multer';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entity_type: { type: 'string', example: 'user' },
        entity_id: { type: 'string', format: 'uuid' },
        category: { type: 'string', example: 'avatar' },
        is_public: { type: 'boolean', default: false },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or parameters' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const upload = await this.uploadsService.uploadFile(
      file,
      userId,
      uploadDto,
    );

    return {
      success: true,
      message: 'File uploaded successfully',
      data: upload,
    };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        entity_type: { type: 'string' },
        entity_id: { type: 'string', format: 'uuid' },
        category: { type: 'string' },
        is_public: { type: 'boolean', default: false },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const uploads = await this.uploadsService.uploadMultiple(
      files,
      userId,
      uploadDto,
    );

    return {
      success: true,
      message: `${uploads.length} file(s) uploaded successfully`,
      data: uploads,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user uploads with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated uploads' })
  async getUploads(@Query() query: QueryUploadsDto, @Req() req: any) {
    const userId = req.user.id;
    const result = await this.uploadsService.getUploads(userId, query);

    return {
      success: true,
      data: result.uploads,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific upload by ID' })
  @ApiResponse({ status: 200, description: 'Returns upload details' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this file',
  })
  async getUpload(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const upload = await this.uploadsService.getUpload(id, userId);

    return {
      success: true,
      data: upload,
    };
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Get a signed URL for accessing a private file' })
  @ApiResponse({ status: 200, description: 'Returns signed URL' })
  async getSignedUrl(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const signedUrl = await this.uploadsService.getSignedUrl(id, userId);

    return {
      success: true,
      data: {
        url: signedUrl,
        expires_in: 3600, // seconds
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an upload' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this file',
  })
  async deleteUpload(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.uploadsService.deleteUpload(id, userId);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}
