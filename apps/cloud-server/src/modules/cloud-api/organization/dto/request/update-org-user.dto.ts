import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
