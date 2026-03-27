import { ApiProperty } from '@nestjs/swagger';

class FeatureSelectOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  value: string;

  @ApiProperty({ example: 'Create Dine-In Order' })
  label: string;
}

export class FeatureSelectResponseDto {
  @ApiProperty({ type: [FeatureSelectOptionDto] })
  options: FeatureSelectOptionDto[];

  @ApiProperty({ example: false })
  hasMore: boolean;
}
