import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import type { AppPlatform } from '@/db/schema';
import { AppPlatformValues } from '@/db/schema';

export class CreateMicrofrontendDto {
  @ApiProperty({ description: 'Unique code (lowercase alphanumeric with hyphens)', example: 'order-mf' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9-]*$/, {
    message: 'Code must be lowercase alphanumeric with hyphens (e.g. "order-mf")',
  })
  code: string;

  @ApiProperty({ description: 'Display name', example: 'Order Microfrontend' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Target platform',
    enum: [AppPlatformValues.WEB, AppPlatformValues.MOBILE],
    example: 'WEB',
  })
  @IsEnum(AppPlatformValues, { message: 'Platform must be WEB or MOBILE' })
  platform: AppPlatform;

  // Required when platform = WEB
  @ApiPropertyOptional({ description: 'Remote entry URL (required for WEB)', example: '/order-mf/remoteEntry.js' })
  @ValidateIf((o) => o.platform === AppPlatformValues.WEB)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  remoteEntry?: string;

  // Required when platform = MOBILE
  @ApiPropertyOptional({
    description: 'Android remote entry URL (required for MOBILE)',
    example: 'https://cdn/.../android/mf-manifest.json',
  })
  @ValidateIf((o) => o.platform === AppPlatformValues.MOBILE)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  remoteEntryAndroid?: string;

  // Required when platform = MOBILE
  @ApiPropertyOptional({
    description: 'iOS remote entry URL (required for MOBILE)',
    example: 'https://cdn/.../ios/mf-manifest.json',
  })
  @ValidateIf((o) => o.platform === AppPlatformValues.MOBILE)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  remoteEntryIos?: string;
}
