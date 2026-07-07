import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { CreatePricesData, PlanPrice, UpdatePriceAmountData } from '@/schemas/admin/prices';

function base(versionId: string, businessId: string, planId: string): string {
  return `admin-api/versions/${versionId}/businesses/${businessId}/plans/${planId}/prices`;
}

// Fetches all price rows for a plan (across countries and billing cycles)
export function getPrices(versionId: string, businessId: string, planId: string): Promise<PlanPrice[]> {
  return axios.get<PlanPrice[]>(base(versionId, businessId, planId)).then((r) => r.data);
}

// Creates price entries for a country across the selected billing cycles
export function createPrices({
  versionId,
  businessId,
  planId,
  data,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  data: CreatePricesData;
}): Promise<CreateResponse<PlanPrice[]>> {
  return axios.post<CreateResponse<PlanPrice[]>>(base(versionId, businessId, planId), data).then((r) => r.data);
}

// Updates the amount of a single price entry
export function updatePriceAmount({
  versionId,
  businessId,
  planId,
  priceId,
  data,
}: {
  versionId: string;
  businessId: string;
  planId: string;
  priceId: string;
  data: UpdatePriceAmountData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${base(versionId, businessId, planId)}/${priceId}`, data).then((r) => r.data);
}

// Deletes a single price entry
export function deletePrice({
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
