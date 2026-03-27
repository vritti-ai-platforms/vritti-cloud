import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
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

  @ApiProperty({ description: 'Target platform', enum: [AppPlatformValues.WEB, AppPlatformValues.MOBILE], example: 'WEB' })
  @IsEnum(AppPlatformValues, { message: 'Platform must be WEB or MOBILE' })
  platform: AppPlatform;

  @ApiProperty({ description: 'Remote entry URL for module federation', example: '/order-mf/remoteEntry.js' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  remoteEntry: string;
}
