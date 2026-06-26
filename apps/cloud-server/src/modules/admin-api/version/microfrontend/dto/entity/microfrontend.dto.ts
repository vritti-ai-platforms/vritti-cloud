import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Microfrontend } from '@/db/schema';

export class MicrofrontendDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  versionId: string;

  @ApiProperty({ example: 'order-mf' })
  code: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  name: string;

  @ApiProperty({ example: 'WEB' })
  platform: string;

  @ApiPropertyOptional({ example: '/order-mf/remoteEntry.js', nullable: true, description: 'Set on WEB rows' })
  remoteEntry: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn/.../android/mf-manifest.json',
    nullable: true,
    description: 'Set on MOBILE rows',
  })
  remoteEntryAndroid: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn/.../ios/mf-manifest.json',
    nullable: true,
    description: 'Set on MOBILE rows',
  })
  remoteEntryIos: string | null;

  // Maps a Microfrontend view row to a MicrofrontendDto (view columns are nullable)
  static from(entity: Microfrontend): MicrofrontendDto {
    const dto = new MicrofrontendDto();
    dto.id = entity.id ?? '';
    dto.versionId = entity.versionId ?? '';
    dto.code = entity.code ?? '';
    dto.name = entity.name ?? '';
    dto.platform = entity.platform ?? '';
    dto.remoteEntry = entity.remoteEntry;
    dto.remoteEntryAndroid = entity.remoteEntryAndroid;
    dto.remoteEntryIos = entity.remoteEntryIos;
    return dto;
  }
}
