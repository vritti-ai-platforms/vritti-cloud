import type { CreateResponse, SuccessResponse, TableResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreatePlanData, Plan, UpdatePlanData } from '@/schemas/admin/plans';

export type PlansResponse = TableResponse<Plan>;

// Plans are version + business scoped
function base(versionId: string, businessId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans`;
}

// Fetches plans for a version + business data table — server applies filter/sort state
export function getPlans(versionId: string, businessId: string): Promise<PlansResponse> {
  return axios.get<PlansResponse>(`${base(versionId, businessId)}/table`).then((r) => r.data);
}

// Fetches a single plan by ID
export function getPlan(versionId: string, businessId: string, id: string): Promise<Plan> {
  return axios.get<Plan>(`${base(versionId, businessId)}/${id}`).then((r) => r.data);
}

// Creates a new plan under the version + business
export function createPlan({
  versionId,
  businessId,
  data,
}: {
  versionId: string;
  businessId: string;
  data: CreatePlanData;
}): Promise<CreateResponse<Plan>> {
  return axios.post<CreateResponse<Plan>>(base(versionId, businessId), data).then((r) => r.data);
}

// Updates an existing plan by ID
export function updatePlan({
  versionId,
  businessId,
  id,
  data,
}: {
  versionId: string;
  businessId: string;
  id: string;
  data: UpdatePlanData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${base(versionId, businessId)}/${id}`, data).then((r) => r.data);
}

// Deletes a plan by ID
export function deletePlan({
  versionId,
  businessId,
  id,
}: {
  versionId: string;
  businessId: string;
  id: string;
}): Promise<void> {
  return axios.delete(`${base(versionId, businessId)}/${id}`).then(() => undefined);
}
