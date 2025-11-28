// batchs/services/farms.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from '../database/entities/Farm.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    private logger: CustomLogger,
  ) {}

  async create(createFarmDto: CreateFarmDto, userId: string) {
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

    return { farms };
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

  async update(farmId: string, updateData: Partial<CreateFarmDto>, userId: string) {
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
}
