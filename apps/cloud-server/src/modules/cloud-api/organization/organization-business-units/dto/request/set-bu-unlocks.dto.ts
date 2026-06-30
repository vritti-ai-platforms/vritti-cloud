import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';

// The BU's per-feature unlock allow-list, code-keyed and version-portable. Mirrors BuUnlocks[buId] exactly:
// featureCode → { web?: [permCode…], mobile?: [permCode…] }. Backend clamps each code to the plan ceiling.
export class SetBuUnlocksDto {
  @ApiProperty({
    description: 'featureCode → { web?: permCodes, mobile?: permCodes } — the BU allow-set (full replace)',
    example: { pos: { web: ['VIEW', 'CREATE'], mobile: ['VIEW'] }, items: { web: ['VIEW'] } },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  // @Type(() => Object) stops ValidationPipe's implicit conversion from mangling the untyped nested map
  @Type(() => Object)
  unlocks: Record<string, { web?: string[]; mobile?: string[] }>;
}
