import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { CreatePriceData, Price, PricesTableResponse, UpdatePriceData } from '@/schemas/admin/prices';

// Fetches prices for a plan in table format
export function getPricesTable(planId: string): Promise<PricesTableResponse> {
  return axios.get<PricesTableResponse>(`admin-api/prices/plan/${planId}/table`).then((r) => r.data);
}

// Creates a new price entry
export function createPrice(data: CreatePriceData): Promise<Price> {
  return axios.post<Price>('admin-api/prices', data).then((r) => r.data);
}

// Updates an existing price by ID
export function updatePrice({ id, data }: { id: string; data: UpdatePriceData }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/prices/${id}`, data).then((r) => r.data);
}

// Deletes a price by ID
export function deletePrice(id: string): Promise<void> {
  return axios.delete(`admin-api/prices/${id}`).then(() => undefined);
}
