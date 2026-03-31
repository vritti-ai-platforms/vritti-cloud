import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MicrofrontendSelectQueryDto {
  @ApiProperty({ description: 'Version ID to scope microfrontends' })
  @IsUUID()
  versionId: string;

  @ApiPropertyOptional({ description: 'Search term to filter by name' })
  @IsOptional()
  @IsString()
  search?: string;
}
