// services/extension-officer.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ExtensionOfficer } from '../database/entities/ExtensionOfficer.entity';
import {
  CreateExtensionOfficerDto,
  UpdateExtensionOfficerDto,
  QueryExtensionOfficerDto,
} from './dto/extension-officer.dto';

@Injectable()
export class ExtensionOfficerService {
  constructor(
    @InjectRepository(ExtensionOfficer)
    private readonly officerRepository: Repository<ExtensionOfficer>,
  ) {}

  async create(dto: CreateExtensionOfficerDto): Promise<ExtensionOfficer> {
    // Check for duplicate email or phone
    const existing = await this.officerRepository.findOne({
      where: [{ email: dto.email }, { phone_number: dto.phone_number }],
    });

    if (existing) {
      throw new ConflictException(
        'Officer with this email or phone number already exists',
      );
    }

    const officer = this.officerRepository.create({
      ...dto,
      status: 'pending_verification',
      is_verified: false,
    });

    return await this.officerRepository.save(officer);
  }

  async findAll(query: QueryExtensionOfficerDto): Promise<{
    data: ExtensionOfficer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      officer_type,
      region,
      status,
      is_verified,
      page = 1,
      limit = 10,
      search,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.officerRepository
      .createQueryBuilder('officer')
      .leftJoinAndSelect('officer.appraisals', 'appraisals');

    if (officer_type) {
      queryBuilder.andWhere('officer.officer_type = :officer_type', {
        officer_type,
      });
    }

    if (region) {
      queryBuilder.andWhere('officer.region = :region', { region });
    }

    if (status) {
      queryBuilder.andWhere('officer.status = :status', { status });
    }

    if (is_verified !== undefined) {
      queryBuilder.andWhere('officer.is_verified = :is_verified', {
        is_verified,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(officer.name ILIKE :search OR officer.email ILIKE :search OR officer.phone_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('officer.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ExtensionOfficer> {
    const officer = await this.officerRepository.findOne({
      where: { id },
      relations: ['appraisals'],
    });

    if (!officer) {
      throw new NotFoundException('Extension officer not found');
    }

    return officer;
  }

  async findByEmail(email: string): Promise<ExtensionOfficer | null> {
    return await this.officerRepository.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<ExtensionOfficer | null> {
    return await this.officerRepository.findOne({
      where: { phone_number: phone },
    });
  }

  async update(
    id: string,
    dto: UpdateExtensionOfficerDto,
  ): Promise<ExtensionOfficer> {
    const officer = await this.findOne(id);

    // Check for duplicate email or phone if being updated
    if (dto.email || dto.phone_number) {
      const existing = await this.officerRepository.findOne({
        where: [
          dto.email ? { email: dto.email } : {},
          dto.phone_number ? { phone_number: dto.phone_number } : {},
        ],
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Officer with this email or phone number already exists',
        );
      }
    }

    Object.assign(officer, dto);
    return await this.officerRepository.save(officer);
  }

  async verify(id: string, verifiedBy: string): Promise<ExtensionOfficer> {
    const officer = await this.findOne(id);

    officer.is_verified = true;
    officer.verified_at = new Date();
    officer.verified_by = verifiedBy;
    officer.status = 'active';

    return await this.officerRepository.save(officer);
  }

  async suspend(id: string): Promise<ExtensionOfficer> {
    const officer = await this.findOne(id);
    officer.status = 'suspended';
    return await this.officerRepository.save(officer);
  }

  async activate(id: string): Promise<ExtensionOfficer> {
    const officer = await this.findOne(id);

    if (!officer.is_verified) {
      throw new BadRequestException(
        'Officer must be verified before activation',
      );
    }

    officer.status = 'active';
    return await this.officerRepository.save(officer);
  }

  async updateStatistics(id: string): Promise<void> {
    const officer = await this.officerRepository.findOne({
      where: { id },
      relations: ['appraisals'],
    });

    if (!officer) {
      throw new NotFoundException('Extension officer not found');
    }

    const appraisals = officer.appraisals || [];
    const totalAppraisals = appraisals.length;

    const ratingsCount = appraisals.filter(
      (a) => a.farmer_rating !== null && a.farmer_rating !== undefined,
    ).length;

    const averageRating =
      ratingsCount > 0
        ? appraisals
            .filter((a) => a.farmer_rating !== null)
            .reduce((sum, a) => sum + (a.farmer_rating || 0), 0) / ratingsCount
        : 0;

    officer.total_appraisals = totalAppraisals;
    officer.average_rating = Number(averageRating.toFixed(2));

    await this.officerRepository.save(officer);
  }

  async getOfficersByRegion(region: string): Promise<ExtensionOfficer[]> {
    return await this.officerRepository.find({
      where: {
        region,
        status: 'active',
        is_verified: true,
      },
      order: {
        average_rating: 'DESC',
      },
    });
  }

  async getTopRatedOfficers(limit: number = 10): Promise<ExtensionOfficer[]> {
    return await this.officerRepository.find({
      where: {
        status: 'active',
        is_verified: true,
      },
      order: {
        average_rating: 'DESC',
        total_appraisals: 'DESC',
      },
      take: limit,
    });
  }

  async delete(id: string): Promise<void> {
    const officer = await this.findOne(id);
    await this.officerRepository.remove(officer);
  }
}
