import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: 'User role in nexus',
    example: 'SUPPORT',
    enum: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  })
  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'SUPPORT'])
  role?: string;
}
