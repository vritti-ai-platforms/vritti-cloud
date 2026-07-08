import { ApiProperty } from '@nestjs/swagger';
import type { BuFeatureLocks } from '@vritti/api-sdk/catalog-resolver';
import { Type } from 'class-transformer';
import { Allow } from 'class-validator';

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
