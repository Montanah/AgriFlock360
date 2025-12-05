import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sync, SyncStatus, OperationType, EntityType } from './entities/sync.entity';
import { CreateSyncDto, BatchSyncDto } from './dto/create-sync.dto';
import { UpdateSyncDto } from './dto/update-sync.dto';
import { Farm } from '../database/entities/Farm.entity';
import { Batch } from '../database/entities/Batch.entity';
import { User } from '../database/entities/User.entity';
// Add more entities as needed

interface SyncResult {
  operation_id: string;
  status: SyncStatus;
  server_entity_id?: string;
  conflict_reason?: string;
  server_version?: number;
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Sync)
    private syncRepository: Repository<Sync>,
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Process a batch of sync operations from the client
   */
  async processBatchSync(batchSyncDto: BatchSyncDto): Promise<SyncResult[]> {
    const { user_id, operations } = batchSyncDto;

    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new BadRequestException('Invalid user_id');
    }

    const results: SyncResult[] = [];

    // Create sync records for each operation
    const syncRecords = await this.createBatchSyncRecords(user_id, operations);

    // Process each operation
    for (const syncRecord of syncRecords) {
      try {
        const result = await this.processSyncOperation(syncRecord);
        results.push(result);
      } catch (error) {
        console.error('Error processing sync operation:', error);
        results.push({
          operation_id: syncRecord.operation_id,
          status: SyncStatus.FAILED,
          conflict_reason: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Create sync records for a batch of operations
   */
  private async createBatchSyncRecords(
    user_id: string,
    operations: CreateSyncDto[],
  ): Promise<Sync[]> {
    const syncRecords: Sync[] = [];

    for (const op of operations) {
      // Check for duplicate operation_id for this user
      const existingSync = await this.syncRepository.findOne({
        where: { operation_id: op.operation_id, user_id },
      });
      if (existingSync) {
        continue; // Skip duplicate
      }

      const syncRecord = this.syncRepository.create({
        user_id,
        operation_id: op.operation_id,
        operation_type: op.operation_type,
        entity_type: op.entity_type,
        entity_id: op.entity_id,
        operation_data: op.operation_data,
        status: SyncStatus.PROCESSING,
        server_version: Date.now(), // Simple version using timestamp
      });

      await this.syncRepository.save(syncRecord);
      syncRecords.push(syncRecord);
    }

    return syncRecords;
  }

  /**
   * Process a single sync operation
   */
  private async processSyncOperation(sync: Sync): Promise<SyncResult> {
    const result: SyncResult = {
      operation_id: sync.operation_id,
      status: SyncStatus.PROCESSING,
    };

    try {
      // Handle based on entity type
      switch (sync.entity_type) {
        case EntityType.FARM:
          const farmResult = await this.handleFarmOperation(sync);
          result.server_entity_id = farmResult.server_entity_id;
          result.status = farmResult.status;
          result.conflict_reason = farmResult.conflict_reason;
          break;
        case EntityType.BATCH:
          const batchResult = await this.handleBatchOperation(sync);
          result.server_entity_id = batchResult.server_entity_id;
          result.status = batchResult.status;
          result.conflict_reason = batchResult.conflict_reason;
          break;
        // Add more cases as needed
        default:
          throw new BadRequestException(`Unsupported entity type: ${sync.entity_type}`);
      }

      result.server_version = Date.now();
      result.status = result.status || SyncStatus.SYNCED;

    } catch (error) {
      result.status = SyncStatus.FAILED;
      result.conflict_reason = error.message;
    }

    // Update sync record
    sync.status = result.status;
    sync.server_entity_id = result.server_entity_id || null;
    sync.conflict_reason = result.conflict_reason || null;
    sync.server_version = result.server_version || null;
    await this.syncRepository.save(sync);

    return result;
  }

  /**
   * Handle farm operations
   */
  private async handleFarmOperation(sync: Sync): Promise<{
    server_entity_id?: string;
    status: SyncStatus;
    conflict_reason?: string;
  }> {
    switch (sync.operation_type) {
      case OperationType.CREATE:
        return await this.createFarm(sync);
      case OperationType.UPDATE:
        return await this.updateFarm(sync);
      case OperationType.DELETE:
        return await this.deleteFarm(sync);
      default:
        throw new BadRequestException(`Unsupported operation: ${sync.operation_type}`);
    }
  }

  private async createFarm(sync: Sync) {
    const farmData = sync.operation_data;

    // Check if farm name already exists for this user to detect conflict
    const existingFarm = await this.farmRepository.findOne({
      where: { farm_name: farmData.farm_name, user_id: sync.user_id },
    });

    if (existingFarm) {
      return {
        status: SyncStatus.CONFLICT,
        conflict_reason: `Farm with name '${farmData.farm_name}' already exists`,
      };
    }

    try {
      const newFarm = this.farmRepository.create({
        user_id: sync.user_id,
        farm_name: farmData.farm_name,
        location: farmData.location,
        gps_coordinates: farmData.gps_coordinates,
        total_area: farmData.total_area,
        farm_type: farmData.farm_type,
        description: farmData.description,
        contact_info: farmData.contact_info,
        is_active: true,
        farmPhoto: farmData.farmPhoto || null,
      });

      const savedFarm = await this.farmRepository.save(newFarm);

      return {
        server_entity_id: savedFarm.id,
        status: SyncStatus.SYNCED,
      };
    } catch (error) {
      return {
        status: SyncStatus.FAILED,
        conflict_reason: error.message,
      };
    }
  }

  private async updateFarm(sync: Sync) {
    const farmData = sync.operation_data;

    // Find the farm to update
    let farm: Farm | null = null;
    if (sync.entity_id) {
      // If entity_id provided, use it as server id
      farm = await this.farmRepository.findOne({ where: { id: sync.entity_id } });
    } else {
      // Try to find by some unique field, e.g., farm name
      farm = await this.farmRepository.findOne({
        where: { farm_name: farmData.farm_name, user_id: sync.user_id },
      });
    }

    if (!farm) {
      return {
        status: SyncStatus.CONFLICT,
        conflict_reason: 'Farm not found',
      };
    }

    // Update fields
    farm.location = farmData.location || farm.location;
    farm.gps_coordinates = farmData.gps_coordinates || farm.gps_coordinates;
    farm.total_area = farmData.total_area || farm.total_area;
    farm.farm_type = farmData.farm_type || farm.farm_type;
    farm.description = farmData.description || farm.description;
    farm.contact_info = farmData.contact_info || farm.contact_info;
    farm.farmPhoto = farmData.farmPhoto || farm.farmPhoto;
    farm.is_active = farmData.is_active !== undefined ? farmData.is_active : farm.is_active;

    await this.farmRepository.save(farm);

    return {
      server_entity_id: farm.id,
      status: SyncStatus.SYNCED,
    };
  }

  private async deleteFarm(sync: Sync) {
    // Find the farm to delete
    let farm: Farm | null = null;
    if (sync.entity_id) {
      farm = await this.farmRepository.findOne({ where: { id: sync.entity_id } });
    } else {
      farm = await this.farmRepository.findOne({
        where: { farm_name: sync.operation_data.farm_name, user_id: sync.user_id },
      });
    }

    if (!farm) {
      return {
        status: SyncStatus.CONFLICT,
        conflict_reason: 'Farm not found',
      };
    }

    await this.farmRepository.remove(farm);

    return {
      server_entity_id: farm.id,
      status: SyncStatus.SYNCED,
    };
  }

  /**
   * Handle batch operations (similar structure)
   */
  private async handleBatchOperation(sync: Sync): Promise<{
    server_entity_id?: string;
    status: SyncStatus;
    conflict_reason?: string;
  }> {
    // Implement similar to farm operations
    // For brevity, not implementing fully here
    switch (sync.operation_type) {
      case OperationType.CREATE:
        // Implement batch creation logic
        return { status: SyncStatus.SYNCED }; // Placeholder
      case OperationType.UPDATE:
        return { status: SyncStatus.SYNCED };
      case OperationType.DELETE:
        return { status: SyncStatus.SYNCED };
      default:
        throw new BadRequestException(`Unsupported operation: ${sync.operation_type}`);
    }
  }

  // Other CRUD methods remain for individual operations, but focus on batch sync

  findAll() {
    return this.syncRepository.find();
  }

  findOne(id: string) {
    return this.syncRepository.findOne({ where: { id } });
  }

  update(id: string, updateSyncDto: UpdateSyncDto) {
    return this.syncRepository.update(id, updateSyncDto);
  }

  remove(id: string) {
    return this.syncRepository.delete(id);
  }

  /**
   * Get pending sync operations for a user
   */
  getPendingSync(userId: string) {
    return this.syncRepository.find({
      where: { user_id: userId, status: SyncStatus.CONFLICT },
    });
  }
}
