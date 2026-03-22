import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { OrgSize } from '@/db/schema';
import { OrgSizeValues } from '@/db/schema';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: 'Display name of the organization', example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Size of the organization',
    enum: ['0-10', '10-20', '20-50', '50-100', '100-500', '500+'],
    example: '0-10',
  })
  @IsOptional()
  @IsEnum(OrgSizeValues)
  size?: OrgSize;
}
