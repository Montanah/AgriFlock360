import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDeviceDto {
  @ApiProperty({ example: 'uuid-of-new-owner' })
  @IsUUID()
  owner_id: string;
}
