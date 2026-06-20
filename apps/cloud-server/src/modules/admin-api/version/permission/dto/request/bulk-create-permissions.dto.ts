import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateFeaturePermissionDto } from './create-feature-permission.dto';

export class BulkCreatePermissionsDto {
  @ApiProperty({ type: [CreateFeaturePermissionDto], description: 'Permissions to create in one batch' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFeaturePermissionDto)
  permissions: CreateFeaturePermissionDto[];
}
