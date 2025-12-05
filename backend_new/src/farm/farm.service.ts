// batchs/services/farms.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from '../database/entities/Farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { Batch, BatchStatus } from 'src/database/entities/Batch.entity';
import { UploadsService } from '../uploads/uploads.service';
import { FileCategory } from '../uploads/dto/upload-file.dto';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private logger: CustomLogger,
    private uploadsService: UploadsService,
  ) {}

  async create(createFarmDto: CreateFarmDto, userId: string) {
    //check if the same name exists for the user
    const existingFarm = await this.farmRepository.findOne({
      where: { farm_name: createFarmDto.farm_name, user_id: userId },
    });

    if (existingFarm) {
      throw new ConflictException('Farm name already exists for this user');
    }

    const farm = this.farmRepository.create({
      ...createFarmDto,
      user_id: userId,
    });

    await this.farmRepository.save(farm);
    this.logger.log(`Farm created: ${farm.farm_name} by user ${userId}`);

    return farm;
  }

  async findAll(userId: string) {
    const farms = await this.farmRepository.find({
      where: { user_id: userId, is_active: true },
      order: { created_at: 'DESC' },
    });

    const activeBatches = await this.batchRepository.count({
        where: { user_id: userId, current_status: BatchStatus.ACTIVE },
      }),
      archivedBatches = await this.batchRepository.count({
        where: { user_id: userId, current_status: BatchStatus.ARCHIVED },
      });
    const totalBatches = await this.batchRepository.count({
      where: { user_id: userId },
    });
    const totalBirds = await this.batchRepository
      .createQueryBuilder('batch')
      .select('SUM(batch.current_count)', 'total_birds')
      .where('batch.user_id = :userId', { userId })
      .getRawOne();

    return {
      farms,
      activeBatches,
      archivedBatches,
      totalFarms: farms.length,
      totalBirds,
      totalBatches,
    };
  }

  async findOne(farmId: string, userId: string) {
    const farm = await this.farmRepository.findOne({
      where: { id: farmId },
      relations: ['batchs'],
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    if (farm.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this farm');
    }

    return farm;
  }

  async update(
    farmId: string,
    updateData: Partial<CreateFarmDto>,
    userId: string,
  ) {
    const farm = await this.findOne(farmId, userId);

    Object.assign(farm, updateData);
    await this.farmRepository.save(farm);

    this.logger.log(`Farm updated: ${farm.farm_name}`);
    return farm;
  }

  async remove(farmId: string, userId: string) {
    const farm = await this.findOne(farmId, userId);

    farm.is_active = false;
    await this.farmRepository.save(farm);

    this.logger.log(`Farm deactivated: ${farm.farm_name}`);
    return { success: true };
  }

  async updateFarmAvatar(
    farmId: string,
    file: any,
    userId: string,
  ): Promise<{ avatar_url: string }> {
    const farm = await this.farmRepository.findOne({ where: { id: farmId } });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    if (farm.user_id !== userId) {
      throw new NotFoundException('Farm not found');
    }

    // Upload avatar using uploads service
    const upload = await this.uploadsService.uploadFile(file, farmId, {
      category: FileCategory.IMAGE,
      entity_type: 'farm',
      entity_id: farmId,
      is_public: true,
    });

    // Update user avatar
    farm.farmPhoto = upload.file_url;
    await this.farmRepository.save(farm);

    this.logger.log(`Farm Avatar updated for farm ${farm.farm_name}`);

    return { avatar_url: upload.file_url };
  }

  async deleteFarmAvatar(farmId: string, userId: string): Promise<void> {
    const farm = await this.farmRepository.findOne({ where: { id: farmId } });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    if (farm.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this farm');
    }

    if (!farm.farmPhoto) {
      throw new BadRequestException('No avatar to delete');
    }

    // Find and delete the avatar upload
    const uploads = await this.uploadsService.getUploads(farmId, {
      category: 'farmAvatar',
      entity_type: 'farm',
    });

    if (uploads.uploads.length > 0) {
      await this.uploadsService.deleteUpload(uploads.uploads[0].id, farmId);
    }

    farm.farmPhoto = null;
    await this.farmRepository.save(farm);

    this.logger.log(`Farm Avatar deleted for farm ${farmId}`);
  }
}
