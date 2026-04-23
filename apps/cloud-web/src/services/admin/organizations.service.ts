import { axios } from '@vritti/quantum-ui/axios';
import type { AdminOrganizationDetail, OrganizationMembersResponse, OrganizationsResponse } from '@/schemas/admin/organizations';

// Fetches organizations for the data table — server applies filter/sort state
export function getOrganizations(): Promise<OrganizationsResponse> {
  return axios.get<OrganizationsResponse>('admin-api/organizations/table').then((r) => r.data);
}

// Fetches a single organization by ID with full details
export function getOrganization(id: string): Promise<AdminOrganizationDetail> {
  return axios.get<AdminOrganizationDetail>(`admin-api/organizations/${id}`).then((r) => r.data);
}

// Syncs the feature catalog from the deployment snapshot to core-server
export function syncOrgFeatures(orgId: string): Promise<void> {
  return axios.post(`admin-api/organizations/${orgId}/sync-features`).then(() => undefined);
}

// Fetches organization members for the data table — server applies filter/sort state
export function getOrganizationMembers(id: string): Promise<OrganizationMembersResponse> {
  return axios.get<OrganizationMembersResponse>(`admin-api/organizations/${id}/members`).then((r) => r.data);
}
