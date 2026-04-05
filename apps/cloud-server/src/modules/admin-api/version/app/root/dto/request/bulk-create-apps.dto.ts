import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateAppDto } from './create-app.dto';

export class BulkCreateAppsDto {
  @ApiProperty({ description: 'Array of apps to create', type: [CreateAppDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAppDto)
  apps: CreateAppDto[];
}
