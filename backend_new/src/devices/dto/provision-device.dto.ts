import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProvisionDeviceDto {
  @ApiProperty({ example: 'MyWiFiNetwork' })
  @IsString()
  wifi_ssid: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  wifi_password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  mqtt_config?: {
    broker?: string;
    port?: number;
    username?: string;
    password?: string;
  };
}
