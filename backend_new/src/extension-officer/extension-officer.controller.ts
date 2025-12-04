// controllers/extension-officer.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExtensionOfficerService } from './extension-officer.service';
import {
  CreateExtensionOfficerDto,
  UpdateExtensionOfficerDto,
  QueryExtensionOfficerDto,
} from './dto/extension-officer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Extension Officers')
@Controller('extension-officers')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth()
export class ExtensionOfficerController {
  constructor(
    private readonly officerService: ExtensionOfficerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new extension officer' })
  @ApiResponse({
    status: 201,
    description: 'Officer successfully registered',
  })
  @ApiResponse({ status: 409, description: 'Officer already exists' })
  async create(@Body() dto: CreateExtensionOfficerDto) {
    return await this.officerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all extension officers' })
  @ApiResponse({ status: 200, description: 'Returns list of officers' })
  async findAll(@Query() query: QueryExtensionOfficerDto) {
    return await this.officerService.findAll(query);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top-rated extension officers' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of officers to return',
  })
  async getTopRated(@Query('limit') limit?: number) {
    return await this.officerService.getTopRatedOfficers(
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Get officers by region' })
  async getByRegion(@Param('region') region: string) {
    return await this.officerService.getOfficersByRegion(region);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get extension officer by ID' })
  @ApiResponse({ status: 200, description: 'Returns officer details' })
  @ApiResponse({ status: 404, description: 'Officer not found' })
  async findOne(@Param('id') id: string) {
    return await this.officerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update extension officer' })
  @ApiResponse({ status: 200, description: 'Officer updated successfully' })
  @ApiResponse({ status: 404, description: 'Officer not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExtensionOfficerDto,
  ) {
    return await this.officerService.update(id, dto);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify an extension officer' })
  @ApiResponse({ status: 200, description: 'Officer verified successfully' })
  async verify(
    @Param('id') id: string,
    @Body('verifiedBy') verifiedBy: string,
  ) {
    return await this.officerService.verify(id, verifiedBy);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend an extension officer' })
  @ApiResponse({
    status: 200,
    description: 'Officer suspended successfully',
  })
  async suspend(@Param('id') id: string) {
    return await this.officerService.suspend(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an extension officer' })
  @ApiResponse({
    status: 200,
    description: 'Officer activated successfully',
  })
  async activate(@Param('id') id: string) {
    return await this.officerService.activate(id);
  }

  @Patch(':id/update-statistics')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update officer statistics' })
  async updateStatistics(@Param('id') id: string) {
    await this.officerService.updateStatistics(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete extension officer' })
  @ApiResponse({ status: 204, description: 'Officer deleted successfully' })
  async delete(@Param('id') id: string) {
    await this.officerService.delete(id);
  }
}