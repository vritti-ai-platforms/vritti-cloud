import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { PlanPrice, UpsertPlanPriceData } from '@/schemas/admin/plan-prices';

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/prices`;
}

// Fetches all price entries for a plan (across countries and billing periods)
export function getPlanPrices(versionId: string, businessId: string, planId: string): Promise<PlanPrice[]> {
  return axios.get<PlanPrice[]>(base(versionId, businessId, planId)).then((r) => r.data);
}

// Upserts a price for a plan in a given country and billing period
export function upsertPlanPrice({
  versionId,
  businessId,
  planId,
  data,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  data: UpsertPlanPriceData;
}): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(base(versionId, businessId, planId), data).then((r) => r.data);
}

// Deletes a price entry from a plan
export function deletePlanPrice({
  versionId,
  businessId,
  planId,
  priceId,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  priceId: string;
}): Promise<void> {
  return axios.delete(`${base(versionId, businessId, planId)}/${priceId}`).then(() => undefined);
}
