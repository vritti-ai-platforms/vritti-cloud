import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { type RoleScope, RoleScopeValues } from '@/db/schema';

export class CreateRoleDto {
  @ApiProperty({ description: 'App version UUID this role belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  appVersionId: string;

  @ApiProperty({ description: 'Display name of the role', example: 'Chef' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the role', example: 'Kitchen staff responsible for food preparation' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RoleScopeValues, description: 'How far the role access extends (GLOBAL, SUBTREE, SINGLE_BU)' })
  @IsEnum(RoleScopeValues)
  scope: RoleScope;

  @ApiPropertyOptional({ description: 'Industry this role belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  industryId?: string;

  @ApiProperty({ description: 'App IDs this role template covers', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  appIds: string[];

  @ApiPropertyOptional({ description: 'Whether this role is a system-defined role', example: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
