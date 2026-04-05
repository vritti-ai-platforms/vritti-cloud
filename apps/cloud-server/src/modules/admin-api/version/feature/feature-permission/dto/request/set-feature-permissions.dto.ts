import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { FeatureTypeValues } from '@/db/schema';

export class SetFeaturePermissionsDto {
  @ApiProperty({
    description: 'Permission types to assign to this feature',
    example: ['VIEW', 'CREATE', 'EDIT'],
    enum: Object.values(FeatureTypeValues),
    isArray: true,
  })
  @IsArray()
  @IsEnum(FeatureTypeValues, { each: true })
  types: string[];
}
