import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrgStorageUsageResponseDto {
  @ApiProperty({ example: 3221225472, description: 'Bytes currently held across the org’s buckets' })
  usedBytes: number;

  @ApiPropertyOptional({
    example: 5368709120,
    nullable: true,
    description: 'Plan allowance in bytes; null when the plan could not be resolved',
  })
  limitBytes: number | null;

  @ApiProperty({ example: true, description: 'False until the org’s buckets have been provisioned' })
  provisioned: boolean;
}
