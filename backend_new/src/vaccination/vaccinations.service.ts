// vaccinations/vaccinations.service.ts (UPDATED)
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { Batch } from '../database/entities/Batch.entity';
import { VaccineCatalog } from '../database/entities/VaccineCatalog.entity';
import { CreateVaccinationDto, CompleteVaccinationDto } from './dto/vaccination.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VaccineCatalogService } from '../vaccine-catalog/vaccine-catalog.service';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectRepository(Vaccination)
    private vaccinationRepository: Repository<Vaccination>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(VaccineCatalog)
    private vaccineCatalogRepository: Repository<VaccineCatalog>,
    private vaccineCatalogService: VaccineCatalogService,
    private logger: CustomLogger,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    batchId: string,
    createVaccinationDto: CreateVaccinationDto,
    userId: string,
  ) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId }
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }


    if (batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    let vaccineCatalog: VaccineCatalog | null = null;
    let vaccinationData: Partial<Vaccination> = {
      batch_id: batchId,
      scheduled_date: createVaccinationDto.scheduled_date,
      notes: createVaccinationDto.notes,
      cost: createVaccinationDto.cost,
      vaccination_status: 'scheduled',
    };

    // If using vaccine from catalog
    if (createVaccinationDto.vaccine_catalog_id) {
      vaccineCatalog = await this.vaccineCatalogRepository.findOne({
        where: { id: createVaccinationDto.vaccine_catalog_id },
      });

      if (!vaccineCatalog) {
        throw new NotFoundException('Vaccine not found in catalog');
      }

      if (!vaccineCatalog.is_active) {
        throw new BadRequestException('This vaccine is no longer active');
      }

      // Use catalog data
      vaccinationData = {
        ...vaccinationData,
        vaccine_catalog_id: vaccineCatalog.id,
        vaccine_name: vaccineCatalog.vaccine_name,
        vaccine_type: vaccineCatalog.vaccine_type,
        dosage: vaccineCatalog.dosage,
        administration_method: vaccineCatalog.administration_method,
        source: 'catalog',
      };

      // Increment usage count
      await this.vaccineCatalogService.incrementUsageCount(vaccineCatalog.id);
    } else {
      // Manual entry
      vaccinationData = {
        ...vaccinationData,
        vaccine_name: createVaccinationDto.vaccine_name,
        vaccine_type: createVaccinationDto.vaccine_type,
        dosage: createVaccinationDto.dosage,
        administration_method: createVaccinationDto.administration_method,
        source: 'manual',
      };
    }

    const vaccination = this.vaccinationRepository.create(vaccinationData);
    await this.vaccinationRepository.save(vaccination);

    this.logger.log(`Vaccination scheduled: ${vaccination.vaccine_name} for batch ${batchId}`);
    
    // Schedule reminder notification (3 days before)
    const scheduledDate = new Date(createVaccinationDto.scheduled_date);
    const reminderDate = new Date(scheduledDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    if (reminderDate > new Date()) {
      await this.notificationsService.createVaccinationReminder(
        userId,
        vaccination.id,
        vaccination.vaccine_name,
        scheduledDate,
      );
    }

    return vaccination;
  }

  async findAll(batchId: string, userId: string) {
    const batch = await this.batchRepository.findOne({ where: { id: batchId } });

    if (!batch || batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const vaccinations = await this.vaccinationRepository.find({
      where: { batch_id: batchId },
      relations: ['vaccine_catalog'],
      order: { scheduled_date: 'ASC' },
    });

    return { 
      vaccinations,
      summary: {
        total: vaccinations.length,
        completed: vaccinations.filter(v => v.vaccination_status === 'completed').length,
        scheduled: vaccinations.filter(v => v.vaccination_status === 'scheduled').length,
        missed: vaccinations.filter(v => v.vaccination_status === 'missed').length,
      },
    };
  }

  async findOne(vaccinationId: string, userId: string) {
    const vaccination = await this.vaccinationRepository.findOne({
      where: { id: vaccinationId },
      relations: ['batch', 'vaccine_catalog'],
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination not found');
    }

    if (vaccination.batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return vaccination;
  }

  async complete(
    vaccinationId: string, 
    userId: string, 
    completeDto: CompleteVaccinationDto,
  ) {
    const vaccination = await this.vaccinationRepository.findOne({
      where: { id: vaccinationId },
      relations: ['batch'],
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination not found');
    }

    if (vaccination.batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (vaccination.vaccination_status === 'completed') {
      throw new BadRequestException('Vaccination already marked as completed');
    }

    vaccination.vaccination_status = 'completed';
    vaccination.completed_date = new Date() as any;
    vaccination.administered_by = completeDto.administered_by;
    vaccination.birds_vaccinated = completeDto.birds_vaccinated;
    
    if (completeDto.cost !== undefined) {
      vaccination.cost = completeDto.cost;
    }
    
    if (completeDto.notes) {
      vaccination.notes = vaccination.notes 
        ? `${vaccination.notes}\n\nCompletion Notes: ${completeDto.notes}`
        : completeDto.notes;
    }

    await this.vaccinationRepository.save(vaccination);
    this.logger.log(`Vaccination completed: ${vaccination.vaccine_name}`);

    return vaccination;
  }

  async updateVaccination(
    vaccinationId: string,
    userId: string,
    updateDto: Partial<CreateVaccinationDto>,
  ) {
    const vaccination = await this.findOne(vaccinationId, userId);

    if (vaccination.vaccination_status === 'completed') {
      throw new BadRequestException('Cannot update completed vaccination');
    }

    Object.assign(vaccination, updateDto);
    await this.vaccinationRepository.save(vaccination);

    this.logger.log(`Vaccination updated: ${vaccination.vaccine_name}`);

    return vaccination;
  }

  async cancelVaccination(vaccinationId: string, userId: string) {
    const vaccination = await this.findOne(vaccinationId, userId);

    if (vaccination.vaccination_status === 'completed') {
      throw new BadRequestException('Cannot cancel completed vaccination');
    }

    vaccination.vaccination_status = 'cancelled';
    await this.vaccinationRepository.save(vaccination);

    this.logger.log(`Vaccination cancelled: ${vaccination.vaccine_name}`);

    return vaccination;
  }

  async deleteVaccination(vaccinationId: string, userId: string) {
    const vaccination = await this.findOne(vaccinationId, userId);

    if (vaccination.vaccination_status === 'completed') {
      throw new BadRequestException('Cannot delete completed vaccination');
    }

    await this.vaccinationRepository.remove(vaccination);
    this.logger.log(`Vaccination deleted: ${vaccination.vaccine_name}`);
  }

  async getRecommendedVaccines(batchId: string, userId: string) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: ['bird_type'],
    });

    if (!batch || batch.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Calculate batch age in days
    const batchAge = Math.floor(
      (new Date().getTime() - new Date(batch.hatch_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get vaccines appropriate for this age
    const recommendedVaccines = await this.vaccineCatalogService.getVaccinesByAge(
      batchAge,
      batch.bird_type?.name,
    );

    // Get already scheduled vaccinations for this batch
    const scheduledVaccinations = await this.vaccinationRepository.find({
      where: { batch_id: batchId },
    });

    const scheduledVaccineIds = scheduledVaccinations.map(v => v.vaccine_catalog_id).filter(Boolean);

    // Filter out already scheduled vaccines
    const unscheduledVaccines = recommendedVaccines.filter(
      vaccine => !scheduledVaccineIds.includes(vaccine.id)
    );

    return {
      batch_age_days: batchAge,
      recommended_vaccines: unscheduledVaccines,
      scheduled_count: scheduledVaccinations.length,
    };
  }

  // Check for missed vaccinations and update status
  async checkMissedVaccinations(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missedVaccinations = await this.vaccinationRepository
      .createQueryBuilder('vaccination')
      .where('vaccination.vaccination_status = :status', { status: 'scheduled' })
      .andWhere('vaccination.scheduled_date < :today', { today })
      .getMany();

    for (const vaccination of missedVaccinations) {
      vaccination.vaccination_status = 'missed';
      await this.vaccinationRepository.save(vaccination);
      
      this.logger.warn(`Vaccination marked as missed: ${vaccination.vaccine_name}`);
    }

    if (missedVaccinations.length > 0) {
      this.logger.log(`Updated ${missedVaccinations.length} missed vaccinations`);
    }
  }
}
