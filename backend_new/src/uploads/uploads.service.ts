// uploads/uploads.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Express } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../database/entities/Upload.entity';
import { User } from '../database/entities/User.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { QueryUploadsDto } from './dto/query-uploads.dto';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../common/custom-logger.service';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';
import * as multer from 'multer';

@Injectable()
export class UploadsService {
  private s3: AWS.S3;
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  private readonly allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB default

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private logger: CustomLogger,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      region: this.configService.get('AWS_REGION')!,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    uploadDto: UploadFileDto,
  ): Promise<Upload> {
    // Validate file
    this.validateFile(file, uploadDto.category);

    // Determine file type
    const fileType = this.getFileType(file.mimetype);

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;

    // Calculate checksum
    const checksum = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Determine S3 path based on category
    const s3Key = this.getS3Key(uploadDto.category, fileType, uniqueFilename);

    let metadata: any = {};
    let variants: any = {};

    // Process images (resize, create variants)
    if (
      fileType === 'image' &&
      this.allowedImageTypes.includes(file.mimetype)
    ) {
      const imageProcessing = await this.processImage(file.buffer, s3Key);
      metadata = imageProcessing.metadata;
      variants = imageProcessing.variants;
    }

    // Upload original file to S3
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('AWS_S3_BUCKET')!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: uploadDto.is_public ? 'public-read' : 'private',
        Metadata: {
          userId,
          originalName: file.originalname,
          checksum,
        },
      })
      .promise();

    // Create upload record
    const upload = this.uploadRepository.create({
      user_id: userId,
      original_filename: file.originalname,
      filename: uniqueFilename,
      file_url: uploadResult.Location,
      file_type: fileType,
      mime_type: file.mimetype,
      file_size: file.size,
      entity_type: uploadDto.entity_type,
      entity_id: uploadDto.entity_id,
      category: uploadDto.category,
      checksum,
      is_public: uploadDto.is_public || false,
      metadata: {
        ...metadata,
        variants,
      },
    });

    await this.uploadRepository.save(upload);

    // Update user avatar if category is avatar
    if (uploadDto.category === 'avatar' && uploadDto.entity_type === 'user') {
      await this.userRepository.update(userId, {
        avatar_url: uploadResult.Location,
      } as any);
    }

    this.logger.log(`File uploaded: ${file.originalname} by user ${userId}`);

    return upload;
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    userId: string,
    uploadDto: UploadFileDto,
  ): Promise<Upload[]> {
    const uploads: Upload[] = [];

    for (const file of files) {
      try {
        const upload = await this.uploadFile(file, userId, uploadDto);
        uploads.push(upload);
      } catch (error) {
        this.logger.error(
          `Failed to upload ${file.originalname}: ${error.message}`,
        );
      }
    }

    return uploads;
  }

  async getUploads(userId: string, query: QueryUploadsDto) {
    const { category, entity_type, file_type, page = 1, limit = 5 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.uploadRepository
      .createQueryBuilder('upload')
      .where('upload.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('upload.created_at', 'DESC');

    if (category) {
      queryBuilder.andWhere('upload.category = :category', { category });
    }

    if (entity_type) {
      queryBuilder.andWhere('upload.entity_type = :entity_type', {
        entity_type,
      });
    }

    if (file_type) {
      queryBuilder.andWhere('upload.file_type = :file_type', { file_type });
    }

    const [uploads, total] = await queryBuilder.getManyAndCount();

    return {
      uploads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUpload(uploadId: string, userId?: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
      relations: ['user'],
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    // Check permissions
    if (!upload.is_public && upload.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this file');
    }

    return upload;
  }

  async deleteUpload(uploadId: string, userId: string): Promise<void> {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    if (upload.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this file');
    }

    // Delete from S3
    const s3Key = this.extractS3Key(upload.file_url);
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('AWS_S3_BUCKET')!,
        Key: s3Key,
      })
      .promise();

    // Delete variants if exist
    if (upload.metadata?.variants) {
      for (const variantUrl of Object.values(upload.metadata.variants)) {
        const variantKey = this.extractS3Key(variantUrl);
        await this.s3
          .deleteObject({
            Bucket: this.configService.get('AWS_S3_BUCKET')!,
            Key: variantKey,
          })
          .promise();
      }
    }

    // Delete from database
    await this.uploadRepository.remove(upload);

    this.logger.log(`File deleted: ${upload.filename} by user ${userId}`);
  }

  async getSignedUrl(uploadId: string, userId?: string): Promise<string> {
    const upload = await this.getUpload(uploadId, userId);

    // If public, return the URL directly
    if (upload.is_public) {
      return upload.file_url;
    }

    // Generate signed URL (valid for 1 hour)
    const s3Key = this.extractS3Key(upload.file_url);
    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.configService.get('AWS_S3_BUCKET')!,
      Key: s3Key,
      Expires: 3600, // 1 hour
    });

    return signedUrl;
  }

  private validateFile(file: Express.Multer.File, category?: string): void {
    // Check file size
    const maxSize =
      category === 'firmware' ? 50 * 1024 * 1024 : this.maxFileSize;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate mime type based on category
    if (category === 'avatar' || category === 'image') {
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid image format. Allowed: JPEG, PNG, GIF, WebP',
        );
      }
    }

    if (category === 'document') {
      if (!this.allowedDocTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid document format');
      }
    }

    if (category === 'video') {
      if (!this.allowedVideoTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid video format. Allowed: MP4, WebM, OGG',
        );
      }
    }
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return 'document';
    if (mimeType === 'application/octet-stream') return 'firmware';
    return 'other';
  }

  private getS3Key(
    category: string | undefined,
    fileType: string,
    filename: string,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `uploads/${category || fileType}/${year}/${month}/${filename}`;
  }

  private async processImage(
    buffer: Buffer,
    originalKey: string,
  ): Promise<{ metadata: any; variants: any }> {
    const image = sharp(buffer);
    const imageMetadata = await image.metadata();

    const variants: any = {};

    // Create small variant (150x150)
    const smallKey = originalKey.replace(/(\.[^.]+)$/, '-small$1');
    const smallBuffer = await image
      .resize(150, 150, { fit: 'cover' })
      .toBuffer();
    await this.uploadToS3(smallKey, smallBuffer, 'image/jpeg');
    variants.small = this.getS3Url(smallKey);

    // Create medium variant (400x400)
    const mediumKey = originalKey.replace(/(\.[^.]+)$/, '-medium$1');
    const mediumBuffer = await image
      .resize(400, 400, { fit: 'cover' })
      .toBuffer();
    await this.uploadToS3(mediumKey, mediumBuffer, 'image/jpeg');
    variants.medium = this.getS3Url(mediumKey);

    // Create large variant (800x800)
    const largeKey = originalKey.replace(/(\.[^.]+)$/, '-large$1');
    const largeBuffer = await image
      .resize(800, 800, { fit: 'inside' })
      .toBuffer();
    await this.uploadToS3(largeKey, largeBuffer, 'image/jpeg');
    variants.large = this.getS3Url(largeKey);

    return {
      metadata: {
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: imageMetadata.format,
      },
      variants,
    };
  }

  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.s3
      .upload({
        Bucket: this.configService.get('AWS_S3_BUCKET')!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
      .promise();
  }

  private getS3Url(key: string): string {
    return `https://${this.configService.get('AWS_S3_BUCKET')!}.s3.${this.configService.get('AWS_REGION')!}.amazonaws.com/${key}`;
  }

  private extractS3Key(url: string): string {
    const urlParts = url.split('.com/');
    return urlParts[1] || url;
  }
}
