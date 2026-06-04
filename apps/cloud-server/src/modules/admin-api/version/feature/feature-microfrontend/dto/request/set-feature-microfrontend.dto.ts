import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetFeatureMicrofrontendDto {
  @ApiProperty({ description: 'Module federation exposed module name', example: './Orders' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  exposedModule: string;

  @ApiProperty({ description: 'Route prefix for this microfrontend link', example: '/orders' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  routePrefix: string;
}
