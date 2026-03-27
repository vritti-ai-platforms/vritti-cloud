import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class PushArtifactsDto {
  @ApiProperty({ description: 'CI-generated artifact metadata (free-form JSON)' })
  @IsObject()
  artifacts: Record<string, unknown>;
}
