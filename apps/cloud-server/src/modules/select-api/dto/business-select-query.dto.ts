import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk';
import { IsOptional, IsUUID } from 'class-validator';

export class BusinessSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Exclude businesses already assigned to this version' })
  @IsOptional()
  @IsUUID()
  notInVersion?: string;

  @ApiPropertyOptional({ description: 'Only include businesses assigned to this version' })
  @IsOptional()
  @IsUUID()
  inVersion?: string;
}
