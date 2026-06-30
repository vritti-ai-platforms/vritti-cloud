import { axios } from '@vritti/quantum-ui/axios';
import type { BuMatrix } from '@/schemas/cloud/bu-matrix';

// Fetches the org's full apps/features/permissions catalog (snapshot-driven, with per-platform lock state) —
// the source for the Create Custom Role permission picker.
export function getOrgPermissions(orgId: string): Promise<BuMatrix> {
  return axios.get<BuMatrix>(`cloud-api/organizations/${orgId}/apps/permissions`).then((r) => r.data);
}
