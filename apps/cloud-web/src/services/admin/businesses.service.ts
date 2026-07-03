import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { Business, BusinessesResponse, CreateBusinessData, UpdateBusinessData } from '@/schemas/admin/businesses';

// Fetches businesses for the data table — server applies filter/sort state
export function getBusinesses(): Promise<BusinessesResponse> {
  return axios.get<BusinessesResponse>('admin-api/businesses/table').then((r) => r.data);
}

// Creates a new business
export function createBusiness(data: CreateBusinessData): Promise<CreateResponse<Business>> {
  return axios.post<CreateResponse<Business>>('admin-api/businesses', data).then((r) => r.data);
}

// Deletes a business by ID
export function deleteBusiness(id: string): Promise<void> {
  return axios.delete(`admin-api/businesses/${id}`).then(() => undefined);
}

// Updates a business by ID
export function updateBusiness({
  id,
  data,
}: {
  id: string;
  data: UpdateBusinessData;
}): Promise<{ success: boolean; message: string }> {
  return axios.patch<{ success: boolean; message: string }>(`admin-api/businesses/${id}`, data).then((r) => r.data);
}
