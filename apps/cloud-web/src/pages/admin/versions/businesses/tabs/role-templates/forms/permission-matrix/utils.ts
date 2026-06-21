import type { Platform, RoleTemplateApp, RoleTemplateGrant } from '@/schemas/admin/role-templates';

export const PLATFORM_LABEL: Record<Platform, string> = { WEB: 'Web', MOBILE: 'Mobile' };
export const PLATFORM_ORDER: Platform[] = ['WEB', 'MOBILE'];

// Key for one platform-scoped grant in the selected set
export function grantKey(featurePermissionId: string, platform: Platform): string {
  return `${featurePermissionId}:${platform}`;
}

// The platforms any of an app's features support, in stable Web→Mobile order — the matrix's fixed columns
export function appPlatforms(app: RoleTemplateApp): Platform[] {
  return PLATFORM_ORDER.filter((p) => app.features.some((f) => f.platforms.includes(p)));
}

// grants[] ⇄ Set<grantKey> for fast lookup in the matrix
export function grantsToKeySet(grants: RoleTemplateGrant[]): Set<string> {
  return new Set(grants.map((g) => grantKey(g.featurePermissionId, g.platform)));
}

export function keySetToGrants(keys: Set<string>): RoleTemplateGrant[] {
  return [...keys].map((key) => {
    const [featurePermissionId, platform] = key.split(':');
    return { featurePermissionId, platform: platform as Platform };
  });
}
