import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { MatrixApp, MatrixMembership } from '@/schemas/admin/permission-matrix';

// The plan matrix shares the role-template matrix shapes (app → feature → permission, per platform)
export type PlanMatrixApp = MatrixApp;
export type PlanMembership = MatrixMembership;

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/permissions`;
}

// Fetches the matrix — apps (catalog) each with the plan's current memberships nested under it
export function getPlanMatrix(
  versionId: string,
  businessId: string,
  planId: string,
): Promise<{ apps: PlanMatrixApp[] }> {
  return axios.get<{ apps: PlanMatrixApp[] }>(base(versionId, businessId, planId)).then((r) => r.data);
}

// Replaces the plan's memberships (each with its unlocked permissions)
export function setPlanUnlocked({
  versionId,
  businessId,
  planId,
  memberships,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  memberships: PlanMembership[];
}): Promise<SuccessResponse> {
  return axios.put<SuccessResponse>(base(versionId, businessId, planId), { memberships }).then((r) => r.data);
}
