import { IsString, IsObject, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CommandTypeEnum {
  SET_TEMPERATURE = 'set_temperature',
  TOGGLE_HEATER = 'toggle_heater',
  TOGGLE_FAN = 'toggle_fan',
  SET_AUTO_MODE = 'set_auto_mode',
  UNLOCK_PAYG = 'unlock_payg',
  LOCK_PAYG = 'lock_payg',
  REBOOT = 'reboot',
}

export class CreateCommandDto {
  @ApiProperty({ enum: CommandTypeEnum, example: CommandTypeEnum.SET_TEMPERATURE })
  @IsEnum(CommandTypeEnum)
  command_type: CommandTypeEnum;

  @ApiProperty({
    example: { target_temp: 30 },
    description: 'Command payload - varies by command type',
  })
  @IsObject()
  payload: any;

  @ApiPropertyOptional({ example: 300, description: 'Command expiry in seconds' })
  @IsOptional()
  expires_in?: number;
}
