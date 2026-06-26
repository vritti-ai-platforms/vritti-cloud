import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeatureMicrofrontendWebLinkDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  microfrontendId: string;

  @ApiProperty({ example: 'order-mf' })
  code: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  name: string;

  @ApiProperty({ example: '/order-mf/remoteEntry.js' })
  remoteEntry: string;

  @ApiProperty({ example: './Orders' })
  exposedModule: string;

  @ApiProperty({ example: '/orders' })
  routePrefix: string;
}

export class FeatureMicrofrontendMobileLinkDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  microfrontendId: string;

  @ApiProperty({ example: 'order-mf' })
  code: string;

  @ApiProperty({ example: 'Order Microfrontend' })
  name: string;

  @ApiProperty({ example: 'https://cdn/.../android/mf-manifest.json' })
  remoteEntryAndroid: string;

  @ApiProperty({ example: 'https://cdn/.../ios/mf-manifest.json' })
  remoteEntryIos: string;

  @ApiProperty({ example: './Orders' })
  exposedModule: string;

  @ApiProperty({ example: '/orders' })
  routePrefix: string;
}

// Per-feature microfrontend links keyed by platform — the admin per-feature tab source
export class FeatureMicrofrontendLinksDto {
  @ApiPropertyOptional({ type: FeatureMicrofrontendWebLinkDto, nullable: true })
  web: FeatureMicrofrontendWebLinkDto | null;

  @ApiPropertyOptional({ type: FeatureMicrofrontendMobileLinkDto, nullable: true })
  mobile: FeatureMicrofrontendMobileLinkDto | null;
}
