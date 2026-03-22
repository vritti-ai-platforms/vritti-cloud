import { ApiProperty } from '@nestjs/swagger';

class AppVersionSelectOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  value: string;

  @ApiProperty({ example: 'Production Release' })
  label: string;

  @ApiProperty({ example: '1.0.0', required: false })
  description?: string;
}

export class AppVersionSelectResponseDto {
  @ApiProperty({ type: [AppVersionSelectOptionDto] })
  options: AppVersionSelectOptionDto[];

  @ApiProperty({ example: false })
  hasMore: boolean;
}
