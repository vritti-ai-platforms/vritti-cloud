import { ApiProperty } from '@nestjs/swagger';

class BusinessSelectOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  value: string;

  @ApiProperty({ example: 'Technology' })
  label: string;
}

export class BusinessSelectResponseDto {
  @ApiProperty({ type: [BusinessSelectOptionDto] })
  options: BusinessSelectOptionDto[];

  @ApiProperty({ example: false })
  hasMore: boolean;
}
