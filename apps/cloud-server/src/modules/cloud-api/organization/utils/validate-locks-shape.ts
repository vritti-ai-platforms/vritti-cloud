import { type FeatureLocks, PLATFORMS } from '@vritti/api-sdk/catalog-resolver';
import { BadRequestException } from '@vritti/api-sdk/exceptions';

// Lightly validates the deny-list shape: featureCode → { web?/mobile?: null | string[] }
export function validateLocksShape(locks: FeatureLocks | undefined): FeatureLocks {
  const result: FeatureLocks = {};
  for (const [featureCode, entry] of Object.entries(locks ?? {})) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new BadRequestException('Each lock entry must map web/mobile to null or a list of permission codes.');
    }
    const cleaned: FeatureLocks[string] = {};
    for (const platform of PLATFORMS) {
      const value = entry[platform];
      if (value === undefined) continue;
      if (value !== null && !(Array.isArray(value) && value.every((code) => typeof code === 'string'))) {
        throw new BadRequestException('Each lock entry must map web/mobile to null or a list of permission codes.');
      }
      cleaned[platform] = value;
    }
    result[featureCode] = cleaned;
  }
  return result;
}
