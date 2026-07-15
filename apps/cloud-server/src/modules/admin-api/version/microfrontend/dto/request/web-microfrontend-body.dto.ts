import { ApiProperty } from '@nestjs/swagger';
import { IsCode } from '@vritti/api-sdk/decorators';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class WebMicrofrontendBodyDto {
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

  @ApiProperty({ description: 'Web remote entry URL', example: '/order-mf/remoteEntry.js' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  remoteEntry: string;
}
