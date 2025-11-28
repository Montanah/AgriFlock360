// devices/dto/ota-progress.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OtaProgressDto {
  @ApiProperty({ example: 'downloading' })
  @IsString()
  status: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({ example: 'Downloaded 4.5MB of 10MB' })
  @IsOptional()
  @IsString()
  message?: string;
}
