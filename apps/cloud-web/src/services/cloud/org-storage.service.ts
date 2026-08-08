import { axios } from '@vritti/quantum-ui/axios';

export interface OrgStorageUsage {
  usedBytes: number;
  limitBytes: number | null;
  provisioned: boolean;
}

// Reads the org's bucket usage live from the storage provider — the server holds no cached figure to serve instead.
export function getOrgStorageUsage(orgId: string): Promise<OrgStorageUsage> {
  return axios.get<OrgStorageUsage>(`cloud-api/organizations/${orgId}/storage`).then((r) => r.data);
}
