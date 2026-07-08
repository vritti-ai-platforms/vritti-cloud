import type { FeatureUnlocks, PlatformBucket, RevokedGrants } from '@vritti/quantum-ui/types/catalog-resolver';
import { MATRIX_PLATFORMS } from '@/schemas/cloud/bu-matrix';

// Composes a based role's effective grants: base ∪ additions − revoked (mirrors the server's composeRoleGrants).
export function composeGrants(
  base: FeatureUnlocks,
  additions: FeatureUnlocks,
  revoked?: RevokedGrants | null,
): FeatureUnlocks {
  const result: FeatureUnlocks = {};
  const codes = new Set([...Object.keys(base), ...Object.keys(additions)]);

  for (const code of codes) {
    const entry: { web?: string[]; mobile?: string[] } = {};
    for (const platform of MATRIX_PLATFORMS) {
      const rev = revoked?.[code]?.[platform];
      if (rev === null) continue;
      const b = base[code]?.[platform];
      const a = additions[code]?.[platform];
      if (b === undefined && a === undefined) continue;
      const union = [...new Set([...(b ?? []), ...(a ?? [])])];
      entry[platform] = rev ? union.filter((c) => !rev.includes(c)) : union;
    }
    if (entry.web !== undefined || entry.mobile !== undefined) result[code] = entry;
  }
  return result;
}

// Diffs the editor's effective selection against the base into additions and revoked grants.
export function diffGrants(
  base: FeatureUnlocks,
  selection: FeatureUnlocks,
): { features: FeatureUnlocks; revoked: RevokedGrants } {
  const features: FeatureUnlocks = {};
  const revoked: RevokedGrants = {};

  const addPlatform = (target: FeatureUnlocks, code: string, platform: PlatformBucket, codes: string[]) => {
    target[code] = { ...target[code], [platform]: codes };
  };

  const codes = new Set([...Object.keys(base), ...Object.keys(selection)]);
  for (const code of codes) {
    for (const platform of MATRIX_PLATFORMS) {
      const b = base[code]?.[platform];
      const s = selection[code]?.[platform];
      if (s !== undefined && b === undefined) {
        // Platform granted beyond the base — the whole grant is an addition (even [] membership)
        addPlatform(features, code, platform, s);
      } else if (s !== undefined && b !== undefined) {
        const extra = s.filter((c) => !b.includes(c));
        if (extra.length > 0) addPlatform(features, code, platform, extra);
        const removed = b.filter((c) => !s.includes(c));
        if (removed.length > 0) revoked[code] = { ...revoked[code], [platform]: removed };
      } else if (s === undefined && b !== undefined) {
        // Platform membership revoked entirely
        revoked[code] = { ...revoked[code], [platform]: null };
      }
    }
  }
  return { features, revoked };
}
