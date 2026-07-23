import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsAllowedOrigin } from '../../decorators/is-allowed-origin.decorator';

export class OAuthInitiateQueryDto {
  @ApiProperty({ description: 'The initiating frontend origin, must be one of ALLOWED_ORIGINS' })
  @IsString()
  @IsNotEmpty()
  @IsAllowedOrigin()
  origin: string;
}
