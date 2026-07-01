import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRoleTemplateDto {
  @ApiProperty({
    description: 'App version UUID this role template belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  versionId: string;

  @ApiProperty({
    description: 'Stable role code — a single lowercase word (hyphens allowed). The durable link to provisioned org roles.',
    example: 'cashier',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @Matches(/^[a-z][a-z0-9-]*$/, { message: 'code must be a single lowercase word (hyphens allowed)' })
  @MaxLength(255)
  code: string;

  @ApiProperty({ description: 'Display name of the role template', example: 'Chef' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the role template',
    example: 'Kitchen staff responsible for food preparation',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
