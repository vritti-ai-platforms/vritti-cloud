import { ApiProperty } from '@nestjs/swagger';

class MicrofrontendSelectOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  value: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  label: string;
}

export class MicrofrontendSelectResponseDto {
  @ApiProperty({ type: [MicrofrontendSelectOptionDto] })
  options: MicrofrontendSelectOptionDto[];

  @ApiProperty({ example: false })
  hasMore: boolean;
}
