import { ApiProperty } from '@nestjs/swagger';

export class FeaturePermissionTypesResponseDto {
  @ApiProperty({ example: ['VIEW', 'CREATE', 'EDIT'], description: 'Permission type strings assigned to this feature' })
  types: string[];
}
