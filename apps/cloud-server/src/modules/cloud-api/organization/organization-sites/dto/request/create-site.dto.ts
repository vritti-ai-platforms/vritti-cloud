import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SiteAppliesValues } from '@/db/schema/enums';

export class CreateSiteDto {
  @ApiProperty({ description: 'Site name', example: 'Indiranagar Store' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Site code', example: 'BLR-IND' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Site type', enum: SiteAppliesValues, example: 'OUTLET' })
  @IsEnum(SiteAppliesValues)
  type: string;

  @ApiPropertyOptional({ description: 'Site group ID the site is managed under', example: 'uuid-here' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Site description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Site timezone', example: 'Asia/Kolkata' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

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
