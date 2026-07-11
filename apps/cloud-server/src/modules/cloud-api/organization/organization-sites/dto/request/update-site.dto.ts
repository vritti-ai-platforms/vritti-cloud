import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SiteAppliesValues } from '@/db/schema/enums';

export class UpdateSiteDto {
  @ApiPropertyOptional({ example: 'Indiranagar Store' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'BLR-IND' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: SiteAppliesValues, example: 'OUTLET' })
  @IsOptional()
  @IsEnum(SiteAppliesValues)
  type?: string;

  @ApiPropertyOptional({ description: 'Site group ID the site is managed under', example: 'uuid-here' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Site description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Owning legal entity ID', example: 'uuid-here' })
  @IsOptional()
  @IsUUID()
  legalEntityId?: string;

  @ApiPropertyOptional({
    description: 'Tax registration ID (must belong to the owning legal entity)',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID()
  registrationId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Karnataka' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;
}
