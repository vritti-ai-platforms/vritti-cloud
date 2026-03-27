import { ApiProperty } from '@nestjs/swagger';

export class FeatureMicrofrontendDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  featureId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  microfrontendId: string;

  @ApiProperty({ example: 'order-mf' })
  microfrontendCode: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  microfrontendName: string;

  @ApiProperty({ example: 'WEB' })
  platform: string;

  @ApiProperty({ example: '/order-mf/remoteEntry.js' })
  remoteEntry: string;

  @ApiProperty({ example: './Orders' })
  exposedModule: string;

  @ApiProperty({ example: '/orders' })
  routePrefix: string;

  // Maps a joined feature-microfrontend row to a FeatureMicrofrontendDto
  static from(row: {
    id: string;
    featureId: string;
    microfrontendId: string;
    exposedModule: string;
    routePrefix: string;
    microfrontendCode: string;
    microfrontendName: string;
    platform: string;
    remoteEntry: string;
  }): FeatureMicrofrontendDto {
    const dto = new FeatureMicrofrontendDto();
    dto.id = row.id;
    dto.featureId = row.featureId;
    dto.microfrontendId = row.microfrontendId;
    dto.microfrontendCode = row.microfrontendCode;
    dto.microfrontendName = row.microfrontendName;
    dto.platform = row.platform;
    dto.remoteEntry = row.remoteEntry;
    dto.exposedModule = row.exposedModule;
    dto.routePrefix = row.routePrefix;
    return dto;
  }
}
