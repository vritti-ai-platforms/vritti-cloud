import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class SetFeatureMicrofrontendDto {
  @ApiProperty({ description: 'Microfrontend UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  microfrontendId: string;

  @ApiProperty({ description: 'Module federation exposed module name', example: './Orders' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^\.\//, { message: 'exposedModule must start with ./ (e.g. ./Orders)' })
  exposedModule: string;

  @ApiProperty({ description: 'Route prefix for this microfrontend link', example: '/orders' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^\//, { message: 'routePrefix must start with / (e.g. /orders)' })
  routePrefix: string;
}
