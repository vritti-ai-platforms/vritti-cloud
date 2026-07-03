import { ApiProperty } from '@nestjs/swagger';
import type { BuFeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import { Type } from 'class-transformer';
import { Allow } from 'class-validator';

// The BU's per-feature lock deny-list, code-keyed and version-portable. Mirrors BuFeatureLocks exactly:
// featureCode → { web?, mobile? } where null locks the whole feature on that platform, string[] locks those
// permission codes, and an absent feature/platform is fully available within the plan. Full replace.
export class SetBuLocksDto {
  @ApiProperty({
    description:
      'featureCode → { web?, mobile? } — the BU deny-list (full replace); platform null locks the whole feature, string[] locks those permission codes',
    example: { pos: { web: ['CREATE'], mobile: null }, items: { web: ['DELETE'] } },
    type: 'object',
    additionalProperties: true,
  })
  @Allow()
  // @Type(() => Object) stops ValidationPipe's implicit conversion from mangling the untyped nested map
  @Type(() => Object)
  locks: BuFeatureLocks;
}
