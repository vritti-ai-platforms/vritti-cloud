import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { PlanPrice, UpsertPlanPriceData } from '@/schemas/admin/plan-prices';

// Fetches all price entries for a plan (across countries and billing periods)
export function getPlanPrices(planId: string): Promise<PlanPrice[]> {
  return axios.get<PlanPrice[]>(`admin-api/plans/${planId}/prices`).then((r) => r.data);
}

// Upserts a price for a plan in a given country and billing period
export function upsertPlanPrice({
  planId,
  data,
}: {
  planId: string;
  data: UpsertPlanPriceData;
}): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`admin-api/plans/${planId}/prices`, data).then((r) => r.data);
}

// Deletes a price entry from a plan
export function deletePlanPrice({ planId, priceId }: { planId: string; priceId: string }): Promise<void> {
  return axios.delete(`admin-api/plans/${planId}/prices/${priceId}`).then(() => undefined);
}
