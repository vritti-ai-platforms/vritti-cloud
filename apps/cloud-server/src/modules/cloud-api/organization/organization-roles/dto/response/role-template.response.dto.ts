import { ApiProperty } from '@nestjs/swagger';

export class RoleTemplateResponseDto {
  @ApiProperty({ example: 'Admin' })
  name: string;

  @ApiProperty({ example: 'ORG', enum: ['ORG', 'BU'] })
  scope: string;

  @ApiProperty({
    example: { 'crm.leads': ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
    description: 'Feature code to permission types mapping',
  })
  features: Record<string, string[]>;
}

export class RoleTemplateListResponseDto {
  @ApiProperty({ type: [RoleTemplateResponseDto] })
  result: RoleTemplateResponseDto[];
}
