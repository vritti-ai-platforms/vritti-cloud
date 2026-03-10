import { axios } from '@vritti/quantum-ui/axios';
import type { CreateIndustryData, IndustriesResponse, UpdateIndustryData } from '@/schemas/admin/industries';

// Fetches industries for the data table — server applies filter/sort state
export function getIndustries(): Promise<IndustriesResponse> {
  return axios.get<IndustriesResponse>('admin-api/industries/table').then((r) => r.data);
}

// Creates a new industry
export function createIndustry(data: CreateIndustryData): Promise<{ success: boolean; message: string }> {
  return axios.post<{ success: boolean; message: string }>('admin-api/industries', data).then((r) => r.data);
}

// Deletes an industry by ID
export function deleteIndustry(id: string): Promise<void> {
  return axios.delete(`admin-api/industries/${id}`).then(() => undefined);
}

// Updates an industry by ID
export function updateIndustry({
  id,
  data,
}: {
  id: string;
  data: UpdateIndustryData;
}): Promise<{ success: boolean; message: string }> {
  return axios.patch<{ success: boolean; message: string }>(`admin-api/industries/${id}`, data).then((r) => r.data);
}
