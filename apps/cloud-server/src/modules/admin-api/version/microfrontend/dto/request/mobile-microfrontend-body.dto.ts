import { ApiProperty } from '@nestjs/swagger';
import { IsCode } from '@vritti/api-sdk/decorators';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MobileMicrofrontendBodyDto {
  @ApiProperty({ description: 'Unique code (lowercase alphanumeric with hyphens)', example: 'order-mf' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsCode()
  code: string;

  @ApiProperty({ description: 'Display name', example: 'Order Microfrontend' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Android remote entry URL', example: 'https://cdn/.../android/mf-manifest.json' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  remoteEntryAndroid: string;

  @ApiProperty({ description: 'iOS remote entry URL', example: 'https://cdn/.../ios/mf-manifest.json' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  remoteEntryIos: string;
}
