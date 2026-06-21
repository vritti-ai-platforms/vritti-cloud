import { axios } from '@vritti/quantum-ui/axios';
import type {
  AdminOrganizationDetail,
  OrganizationMembersResponse,
  OrganizationsResponse,
} from '@/schemas/admin/organizations';

function base(deploymentId: string): string {
  return `admin-api/deployments/${deploymentId}/organizations`;
}

// Fetches organizations on a deployment for the data table — server applies filter/sort state
export function getOrganizations(deploymentId: string): Promise<OrganizationsResponse> {
  return axios.get<OrganizationsResponse>(`${base(deploymentId)}/table`).then((r) => r.data);
}

// Fetches a single organization by ID with full details
export function getOrganization(deploymentId: string, id: string): Promise<AdminOrganizationDetail> {
  return axios.get<AdminOrganizationDetail>(`${base(deploymentId)}/${id}`).then((r) => r.data);
}

// Syncs the feature catalog from the deployment snapshot to core-server
export function syncOrgFeatures(deploymentId: string, orgId: string): Promise<void> {
  return axios.post(`${base(deploymentId)}/${orgId}/sync-features`).then(() => undefined);
}

// Fetches organization members for the data table — server applies filter/sort state
export function getOrganizationMembers(deploymentId: string, id: string): Promise<OrganizationMembersResponse> {
  return axios.get<OrganizationMembersResponse>(`${base(deploymentId)}/${id}/members`).then((r) => r.data);
}
