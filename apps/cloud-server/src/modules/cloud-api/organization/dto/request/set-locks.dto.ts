import { ApiProperty } from '@nestjs/swagger';
import type { FeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import { Type } from 'class-transformer';
import { Allow } from 'class-validator';

export class SetLocksDto {
  @ApiProperty({
    description:
      'featureCode → { web?, mobile? } — the deny-list for this scope (full replace); platform null locks the whole feature, string[] locks those permission codes',
    example: { pos: { web: ['CREATE'], mobile: null }, items: { web: ['DELETE'] } },
    type: 'object',
    additionalProperties: true,
  })
  @Allow()
  // @Type(() => Object) stops ValidationPipe's implicit conversion from mangling the untyped nested map
  @Type(() => Object)
  locks: FeatureLocks;
}
