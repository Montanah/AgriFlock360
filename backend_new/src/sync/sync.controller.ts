import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { CreateSyncDto, BatchSyncDto } from './dto/create-sync.dto';
import { UpdateSyncDto } from './dto/update-sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncStatus } from './entities/sync.entity';

interface SyncResult {
  operation_id: string;
  status: SyncStatus;
  server_entity_id?: string;
  conflict_reason?: string;
  server_version?: number;
}

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // Batch sync endpoint - main endpoint for offline-first sync
  @Post('batch')
  processBatchSync(@Body() batchSyncDto: BatchSyncDto): Promise<SyncResult[]> {
    return this.syncService.processBatchSync(batchSyncDto);
  }

  // Get pending/conflicted sync operations for a user
  @Get('pending/:userId')
  getPendingSync(@Param('userId') userId: string) {
    return this.syncService.getPendingSync(userId);
  }

  // Other CRUD endpoints for individual operations (optional)

  @Post()
  create(@Body() createSyncDto: CreateSyncDto) {
    // This could create individual sync operations if needed
    // But main sync is via batch
    return 'Individual sync creation not implemented, use batch endpoint';
  }

  @Get()
  findAll() {
    return this.syncService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSyncDto: UpdateSyncDto) {
    return this.syncService.update(id, updateSyncDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.syncService.remove(id);
  }
}
