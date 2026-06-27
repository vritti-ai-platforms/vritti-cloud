import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

export class SetFeatureAppDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'App (of this business) the feature belongs to; null to remove the feature from this business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ValidateIf((o) => o.appId !== null && o.appId !== undefined)
  @IsUUID()
  appId: string | null;
}
