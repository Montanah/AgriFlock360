// vaccine-catalog/vaccine-catalog.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { VaccineCatalog } from '../database/entities/VaccineCatalog.entity';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccinesDto } from '../vaccination/dto/vaccination.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class VaccineCatalogService {
  constructor(
    @InjectRepository(VaccineCatalog)
    private vaccineCatalogRepository: Repository<VaccineCatalog>,
    private logger: CustomLogger,
  ) { }

  async createVaccine(createDto: CreateVaccineDto): Promise<VaccineCatalog> {
    // Check if vaccine with same name exists
    const existing = await this.vaccineCatalogRepository.findOne({
      where: { vaccine_name: createDto.vaccine_name },
    });

    if (existing) {
      throw new ConflictException('Vaccine with this name already exists');
    }

    const vaccine = this.vaccineCatalogRepository.create(createDto);
    await this.vaccineCatalogRepository.save(vaccine);

    this.logger.log(`Vaccine created: ${vaccine.vaccine_name}`);

    return vaccine;
  }

  async getVaccines(query: QueryVaccinesDto) {
    const {
      search,
      vaccine_type,
      bird_type,
      target_disease,
      is_recommended,
      is_active,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.vaccineCatalogRepository
      .createQueryBuilder('vaccine')
      .skip(skip)
      .take(limit)
      .orderBy('vaccine.is_recommended', 'DESC')
      .addOrderBy('vaccine.usage_count', 'DESC')
      .addOrderBy('vaccine.vaccine_name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        '(vaccine.vaccine_name ILIKE :search OR vaccine.description ILIKE :search OR vaccine.target_disease ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (vaccine_type) {
      queryBuilder.andWhere('vaccine.vaccine_type = :vaccine_type', { vaccine_type });
    }

    if (bird_type) {
      queryBuilder.andWhere('(vaccine.bird_type = :bird_type OR vaccine.bird_type = :all)', {
        bird_type,
        all: 'all',
      });
    }

    if (target_disease) {
      queryBuilder.andWhere('vaccine.target_disease ILIKE :target_disease', {
        target_disease: `%${target_disease}%`,
      });
    }

    if (is_recommended !== undefined) {
      queryBuilder.andWhere('vaccine.is_recommended = :is_recommended', { is_recommended });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('vaccine.is_active = :is_active', { is_active });
    }

    const [vaccines, total] = await queryBuilder.getManyAndCount();

    return {
      vaccines,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVaccine(id: string): Promise<VaccineCatalog> {
    const vaccine = await this.vaccineCatalogRepository.findOne({
      where: { id },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    return vaccine;
  }

  async updateVaccine(id: string, updateDto: UpdateVaccineDto): Promise<VaccineCatalog> {
    const vaccine = await this.getVaccine(id);

    // Check if new name conflicts
    if (updateDto.vaccine_name && updateDto.vaccine_name !== vaccine.vaccine_name) {
      const existing = await this.vaccineCatalogRepository.findOne({
        where: { vaccine_name: updateDto.vaccine_name },
      });

      if (existing) {
        throw new ConflictException('Vaccine with this name already exists');
      }
    }

    Object.assign(vaccine, updateDto);
    await this.vaccineCatalogRepository.save(vaccine);

    this.logger.log(`Vaccine updated: ${vaccine.vaccine_name}`);

    return vaccine;
  }

  async deleteVaccine(id: string): Promise<void> {
    const vaccine = await this.vaccineCatalogRepository.findOne({
      where: { id },
      relations: ['vaccinations'],
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    // Check if vaccine has been used
    if (vaccine.vaccinations && vaccine.vaccinations.length > 0) {
      // Soft delete - just deactivate
      vaccine.is_active = false;
      await this.vaccineCatalogRepository.save(vaccine);
      this.logger.log(`Vaccine deactivated (has usage history): ${vaccine.vaccine_name}`);
    } else {
      // Hard delete - no usage history
      await this.vaccineCatalogRepository.remove(vaccine);
      this.logger.log(`Vaccine deleted: ${vaccine.vaccine_name}`);
    }
  }

  async getRecommendedVaccines(birdType?: string): Promise<VaccineCatalog[]> {
    const queryBuilder = this.vaccineCatalogRepository
      .createQueryBuilder('vaccine')
      .where('vaccine.is_recommended = :recommended', { recommended: true })
      .andWhere('vaccine.is_active = :active', { active: true })
      .orderBy('vaccine.recommended_age_min', 'ASC')
      .addOrderBy('vaccine.usage_count', 'DESC');

    if (birdType) {
      queryBuilder.andWhere('(vaccine.bird_type = :bird_type OR vaccine.bird_type = :all)', {
        bird_type: birdType,
        all: 'all',
      });
    }

    return queryBuilder.getMany();
  }

  async getVaccinesByAge(batchAgeInDays: number, birdType?: string): Promise<VaccineCatalog[]> {
    const queryBuilder = this.vaccineCatalogRepository
      .createQueryBuilder('vaccine')
      .where('vaccine.is_active = :active', { active: true })
      .andWhere(
        '(vaccine.recommended_age_min <= :age AND (vaccine.recommended_age_max >= :age OR vaccine.recommended_age_max IS NULL))',
        { age: batchAgeInDays },
      )
      .orderBy('vaccine.is_recommended', 'DESC')
      .addOrderBy('vaccine.usage_count', 'DESC');

    if (birdType) {
      queryBuilder.andWhere('(vaccine.bird_type = :bird_type OR vaccine.bird_type = :all)', {
        bird_type: birdType,
        all: 'all',
      });
    }

    return queryBuilder.getMany();
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.vaccineCatalogRepository.increment({ id }, 'usage_count', 1);
  }

  async getVaccineTypes(): Promise<string[]> {
    const result = await this.vaccineCatalogRepository
      .createQueryBuilder('vaccine')
      .select('DISTINCT vaccine.vaccine_type', 'type')
      .where('vaccine.is_active = :active', { active: true })
      .orderBy('vaccine.vaccine_type', 'ASC')
      .getRawMany();

    return result.map(r => r.type).filter(Boolean);
  }

  async getTargetDiseases(): Promise<string[]> {
    const result = await this.vaccineCatalogRepository
      .createQueryBuilder('vaccine')
      .select('DISTINCT vaccine.target_disease', 'disease')
      .where('vaccine.is_active = :active', { active: true })
      .where('vaccine.target_disease IS NOT NULL')
      .orderBy('vaccine.target_disease', 'ASC')
      .getRawMany();

    return result.map(r => r.disease).filter(Boolean);
  }

  async getPopularVaccines(limit: number = 10): Promise<VaccineCatalog[]> {
    return this.vaccineCatalogRepository.find({
      where: { is_active: true },
      order: { usage_count: 'DESC' },
      take: limit,
    });
  }

  // Seed common poultry vaccines
  async seedCommonVaccines(): Promise<void> {

    const commonVaccines: CreateVaccineDto[] = [
      {
        vaccine_name: 'Newcastle Disease Vaccine (Live)',
        vaccine_type: 'viral',
        description: 'Live attenuated vaccine against Newcastle Disease, one of the most important poultry diseases',
        dosage: '1 drop per bird',
        administration_method: 'eye_drop',
        recommended_age_min: 1,
        recommended_age_max: 7,
        recommended_age_description: 'Day 1-7',
        target_disease: 'Newcastle Disease',
        bird_type: 'all',
        is_recommended: true,
        usage_instructions: 'Administer one drop in the eye. Ensure all birds receive the vaccine.',
        precautions: 'Store at 2-8°C. Use within 2 hours after reconstitution.',
        storage_conditions: '2-8°C',
        withdrawal_period_days: 0,
      },
      {
        vaccine_name: "Marek's Disease Vaccine",
        vaccine_type: 'viral',
        description: 'Protects against Marek\'s disease, a highly contagious viral disease',
        dosage: '0.2ml per bird',
        administration_method: 'injection',
        recommended_age_min: 1,
        recommended_age_max: 1,
        recommended_age_description: 'Day 1 (hatchery)',
        target_disease: "Marek's Disease",
        bird_type: 'all',
        is_recommended: true,
        usage_instructions: 'Administer subcutaneously at day old in the hatchery',
        storage_conditions: '-20°C or colder',
        withdrawal_period_days: 0,
      },
      {
        vaccine_name: 'Infectious Bronchitis Vaccine',
        vaccine_type: 'viral',
        description: 'Protects against Infectious Bronchitis virus affecting respiratory system',
        dosage: '0.03ml per bird',
        administration_method: 'spray',
        recommended_age_min: 1,
        recommended_age_max: 7,
        recommended_age_description: 'Day 1-7',
        target_disease: 'Infectious Bronchitis',
        bird_type: 'all',
        is_recommended: true,
        storage_conditions: '2-8°C',
        withdrawal_period_days: 0,
      },
      {
        vaccine_name: 'Gumboro Disease Vaccine (IBD)',
        vaccine_type: 'viral',
        description: 'Protection against Infectious Bursal Disease (Gumboro)',
        dosage: '0.03ml per bird',
        administration_method: 'drinking_water',
        recommended_age_min: 10,
        recommended_age_max: 14,
        recommended_age_description: 'Day 10-14',
        target_disease: 'Infectious Bursal Disease',
        bird_type: 'all',
        is_recommended: true,
        usage_instructions: 'Dissolve in chlorine-free drinking water. Ensure all birds drink within 2 hours.',
        storage_conditions: '2-8°C',
        withdrawal_period_days: 0,
      },
      {
        vaccine_name: 'Fowl Pox Vaccine',
        vaccine_type: 'viral',
        description: 'Protects against Fowl Pox disease',
        dosage: '1 dose per bird',
        administration_method: 'injection',
        recommended_age_min: 56,
        recommended_age_max: 84,
        recommended_age_description: 'Week 8-12',
        target_disease: 'Fowl Pox',
        bird_type: 'layers',
        is_recommended: true,
        usage_instructions: 'Administer by wing web stab method',
        storage_conditions: '2-8°C',
        withdrawal_period_days: 0,
      },

      {
        "vaccine_name": "Mareks Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Marek’s disease",
        "dosage": "1 dose per bird",
        "administration_method": "IM",
        "recommended_age_min": 1,
        "recommended_age_max": 1,
        "recommended_age_description": "Day 1",
        "target_disease": "Marek's",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Administer via intramuscular injection at hatchery",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "NCD + IB Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Newcastle Disease and Infectious Bronchitis",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 7,
        "recommended_age_max": 7,
        "recommended_age_description": "Day 7",
        "target_disease": "Newcastle Disease, Infectious Bronchitis",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Mix in clean drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Gumboro Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Gumboro disease",
        "dosage": "As per manufacturer instructions",
        "administration_method": "eye drop or drinking water",
        "recommended_age_min": 14,
        "recommended_age_max": 14,
        "recommended_age_description": "Day 14",
        "target_disease": "Gumboro",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Administer via eye drop or drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "NCD + IB Vaccine",
        "vaccine_type": "viral",
        "description": "Booster for Newcastle Disease and Infectious Bronchitis",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 21,
        "recommended_age_max": 21,
        "recommended_age_description": "Day 21",
        "target_disease": "Newcastle Disease, Infectious Bronchitis",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Mix in clean drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Gumboro Vaccine",
        "vaccine_type": "viral",
        "description": "Booster dose for Gumboro disease",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 28,
        "recommended_age_max": 28,
        "recommended_age_description": "Day 28",
        "target_disease": "Gumboro",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Mix in drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Fowl Pox Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Fowl Pox disease",
        "dosage": "1 dose per bird",
        "administration_method": "wing stab",
        "recommended_age_min": 42,
        "recommended_age_max": 49,
        "recommended_age_description": "Week 6",
        "target_disease": "Fowl Pox",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Administer using wing web stab method",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Fowl Typhoid Vaccine",
        "vaccine_type": "bacterial",
        "description": "Protects against Fowl Typhoid",
        "dosage": "As per manufacturer instructions",
        "administration_method": "injection (thigh muscle)",
        "recommended_age_min": 56,
        "recommended_age_max": 56,
        "recommended_age_description": "Week 8",
        "target_disease": "Fowl Typhoid",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Administer via thigh muscle injection",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Dewormer",
        "vaccine_type": "antiparasitic",
        "description": "Treats internal parasites",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 84,
        "recommended_age_max": 84,
        "recommended_age_description": "Week 12",
        "target_disease": "Internal parasites",
        "bird_type": "kienyeji",
        "is_recommended": true,
        "usage_instructions": "Mix in drinking water",
        "storage_conditions": "Store in cool dry place",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "NCD + IB Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Newcastle Disease and Infectious Bronchitis",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 12,
        "recommended_age_max": 14,
        "recommended_age_description": "Day 12-14",
        "target_disease": "Newcastle Disease, Infectious Bronchitis",
        "bird_type": "broiler",
        "is_recommended": true,
        "usage_instructions": "Mix in clean drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },
      {
        "vaccine_name": "Gumboro Vaccine",
        "vaccine_type": "viral",
        "description": "Protects against Gumboro disease",
        "dosage": "As per manufacturer instructions",
        "administration_method": "drinking water",
        "recommended_age_min": 18,
        "recommended_age_max": 21,
        "recommended_age_description": "Day 18-21",
        "target_disease": "Gumboro",
        "bird_type": "broiler",
        "is_recommended": true,
        "usage_instructions": "Mix in drinking water",
        "storage_conditions": "2-8°C",
        "withdrawal_period_days": 0
      },




    ];

    for (const vaccine of commonVaccines) {
      try {
        await this.createVaccine(vaccine);
      } catch (error) {
        if (error instanceof ConflictException) {
          this.logger.warn(`Vaccine already exists: ${vaccine.vaccine_name}`);
        } else {
          this.logger.error(`Failed to seed vaccine: ${vaccine.vaccine_name}`, error);
        }
      }
    }

    this.logger.log('Common vaccines seeded successfully');
  }
}