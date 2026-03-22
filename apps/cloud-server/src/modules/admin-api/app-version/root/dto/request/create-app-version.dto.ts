import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAppVersionDto {
  @ApiProperty({ description: 'Semantic version string', example: '1.0.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.-]+)?$/, {
    message: 'Version must be semver-like (e.g. "1.0.0", "2.1.0-beta.1")',
  })
  version: string;

  @ApiProperty({ description: 'Display name for this version', example: 'Initial Release' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;
}
