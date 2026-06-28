import type { MatrixApp, MatrixMembership, Platform } from '@/schemas/admin/permission-matrix';

export const PLATFORM_LABEL: Record<Platform, string> = { WEB: 'Web', MOBILE: 'Mobile' };
export const PLATFORM_ORDER: Platform[] = ['WEB', 'MOBILE'];

// Key for one (feature, platform) cell — used for both membership presence and grant buckets
export function cellKey(featureId: string, platform: Platform): string {
  return `${featureId}:${platform}`;
}

// The platforms any of an app's features support, in stable Web→Mobile order — the matrix's fixed columns
export function appPlatforms(app: MatrixApp): Platform[] {
  return PLATFORM_ORDER.filter((p) => app.features.some((f) => f.platforms.includes(p)));
}

// Matrix state as a Map<cellKey, Set<featurePermissionId>>: a key present = a member; its set = granted permissions.
export type MatrixState = Map<string, Set<string>>;

// Build the lookup map from a memberships array (the field-array value)
export function buildState(memberships: MatrixMembership[]): MatrixState {
  return new Map(memberships.map((m) => [cellKey(m.featureId, m.platform), new Set(m.permissions)]));
}

// Count of an app's features that are a member on at least one of the given platform columns
export function addedFeatureCount(app: MatrixApp, columns: Platform[], state: MatrixState): number {
  return app.features.filter((f) => columns.some((pf) => state.has(cellKey(f.id, pf)))).length;
}
