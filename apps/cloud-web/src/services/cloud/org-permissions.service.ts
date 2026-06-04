import { axios } from '@vritti/quantum-ui/axios';
import type { OrgPermissionGroup } from '@/schemas/cloud/org-roles';

// Fetches permissions grouped by app for the organization
export function getOrgPermissions(orgId: string): Promise<OrgPermissionGroup[]> {
  return axios
    .get<{ apps: OrgPermissionGroup[] }>(`cloud-api/organizations/${orgId}/apps/permissions`)
    .then((r) => r.data.apps);
}
