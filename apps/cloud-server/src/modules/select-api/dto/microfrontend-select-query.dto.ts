import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MicrofrontendSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by version ID' })
  @IsOptional()
  @IsUUID()
  versionId?: string;

  @ApiPropertyOptional({ description: 'Filter by platform (e.g. WEB, MOBILE)' })
  @IsOptional()
  @IsString()
  platform?: string;
}
