import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { VersionBusiness, VersionBusinessesTableResponse } from '@/schemas/admin/version-businesses';

// Fetches businesses assigned to a version for the data table — server applies filter/sort/pagination state
export function getVersionBusinessesTable(versionId: string): Promise<VersionBusinessesTableResponse> {
  return axios
    .get<VersionBusinessesTableResponse>(`admin-api/versions/${versionId}/businesses/table`)
    .then((r) => r.data);
}

// Fetches businesses assigned to a version with per-business app counts (lightweight list, non-table consumers)
export function getVersionBusinesses(versionId: string): Promise<VersionBusiness[]> {
  return axios.get<VersionBusiness[]>(`admin-api/versions/${versionId}/businesses`).then((r) => r.data);
}

// Assigns a business to a version
export function assignVersionBusiness({
  versionId,
  businessId,
}: {
  versionId: string;
  businessId: string;
}): Promise<CreateResponse<VersionBusiness>> {
  return axios
    .post<CreateResponse<VersionBusiness>>(`admin-api/versions/${versionId}/businesses`, { businessId })
    .then((r) => r.data);
}

// Unassigns a business from a version
export function unassignVersionBusiness({
  versionId,
  businessId,
}: {
  versionId: string;
  businessId: string;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}`)
    .then((r) => r.data);
}
