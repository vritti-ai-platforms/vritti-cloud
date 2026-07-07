import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  BillingCycle,
  BillingCyclesTableResponse,
  CreateBillingCycleData,
  UpdateBillingCycleData,
} from '@/schemas/admin/billing-cycles';

// Fetches billing cycles for the data table — server applies filter/sort state
export function getBillingCyclesTable(): Promise<BillingCyclesTableResponse> {
  return axios.get<BillingCyclesTableResponse>('admin-api/billing-cycles').then((r) => r.data);
}

// Creates a new billing cycle
export function createBillingCycle(data: CreateBillingCycleData): Promise<CreateResponse<BillingCycle>> {
  return axios.post<CreateResponse<BillingCycle>>('admin-api/billing-cycles', data).then((r) => r.data);
}

// Fetches a single billing cycle by ID
export function getBillingCycle(id: string): Promise<BillingCycle> {
  return axios.get<BillingCycle>(`admin-api/billing-cycles/${id}`).then((r) => r.data);
}

// Updates a billing cycle by ID
export function updateBillingCycle({
  id,
  data,
}: {
  id: string;
  data: UpdateBillingCycleData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`admin-api/billing-cycles/${id}`, data).then((r) => r.data);
}

// Deletes a billing cycle by ID
export function deleteBillingCycle(id: string): Promise<void> {
  return axios.delete(`admin-api/billing-cycles/${id}`).then(() => undefined);
}
