import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrgUserDto {
  @ApiPropertyOptional({ description: 'Updated email address', example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Updated full name', example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Updated account status',
    example: 'ACTIVE',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
  })
  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Updated locale', example: 'en-US' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  locale?: string;

  @ApiPropertyOptional({ description: 'Updated timezone', example: 'America/New_York' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone?: string;
}
