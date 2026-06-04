import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { AppPlatform } from '@/db/schema';
import { AppPlatformValues } from '@/db/schema';

export class UpdateMicrofrontendDto {
  @ApiPropertyOptional({ description: 'Unique code (lowercase alphanumeric with hyphens)', example: 'order-mf' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9-]*$/, {
    message: 'Code must be lowercase alphanumeric with hyphens (e.g. "order-mf")',
  })
  code?: string;

  @ApiPropertyOptional({ description: 'Display name', example: 'Order Microfrontend' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Target platform', enum: [AppPlatformValues.WEB, AppPlatformValues.MOBILE], example: 'WEB' })
  @IsOptional()
  @IsEnum(AppPlatformValues, { message: 'Platform must be WEB or MOBILE' })
  platform?: AppPlatform;

  @ApiPropertyOptional({ description: 'Remote entry URL for module federation', example: '/order-mf/remoteEntry.js' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  remoteEntry?: string;
}
