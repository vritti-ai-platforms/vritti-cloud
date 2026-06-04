import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { CreateRegionData, Region, RegionsResponse, UpdateRegionData } from '@/schemas/admin/regions';

// Fetches regions for the data table — server applies filter/sort state
export function getRegions(): Promise<RegionsResponse> {
  return axios.get<RegionsResponse>('admin-api/regions/table').then((r) => r.data);
}

// Fetches a single region by ID
export function getRegion(id: string): Promise<Region> {
  return axios.get<Region>(`admin-api/regions/${id}`).then((r) => r.data);
}

// Creates a new region
export function createRegion(data: CreateRegionData): Promise<CreateResponse<Region>> {
  return axios.post<CreateResponse<Region>>('admin-api/regions', data).then((r) => r.data);
}

// Updates an existing region by ID
export function updateRegion(id: string, data: UpdateRegionData): Promise<Region> {
  return axios.patch<Region>(`admin-api/regions/${id}`, data).then((r) => r.data);
}

// Deletes a region by ID
export function deleteRegion(id: string): Promise<void> {
  return axios.delete(`admin-api/regions/${id}`).then(() => undefined);
}

// Assigns a cloud provider to a region
export function addCloudProvider(regionId: string, providerId: string): Promise<void> {
  return axios.post(`admin-api/regions/${regionId}/cloud-providers/${providerId}`).then(() => undefined);
}

// Removes a cloud provider from a region
export function removeCloudProvider(regionId: string, providerId: string): Promise<void> {
  return axios.delete(`admin-api/regions/${regionId}/cloud-providers/${providerId}`).then(() => undefined);
}
