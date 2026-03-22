import { ApiProperty } from '@nestjs/swagger';
import type { Microfrontend } from '@/db/schema';

export class MicrofrontendDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appVersionId: string;

  @ApiProperty({ example: 'order-mf' })
  code: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  name: string;

  @ApiProperty({ example: 'WEB' })
  platform: string;

  @ApiProperty({ example: '/order-mf/remoteEntry.js' })
  remoteEntry: string;

  // Maps a Microfrontend entity to a MicrofrontendDto
  static from(entity: Microfrontend): MicrofrontendDto {
    const dto = new MicrofrontendDto();
    dto.id = entity.id;
    dto.appVersionId = entity.appVersionId;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.platform = entity.platform;
    dto.remoteEntry = entity.remoteEntry;
    return dto;
  }
}
