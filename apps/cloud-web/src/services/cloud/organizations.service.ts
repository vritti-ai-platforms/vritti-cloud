import { axios } from '@vritti/quantum-ui/axios';
import type { InviteUserFormData, NexusUser, OrgListItem, PaginatedResponse, SubdomainAvailability } from '@/schemas/cloud/organizations';

// Fetches paginated organizations the current user belongs to
export function getMyOrgs(params?: { offset?: number; limit?: number }): Promise<PaginatedResponse<OrgListItem>> {
  return axios.get<PaginatedResponse<OrgListItem>>('cloud-api/organizations/me', { params }).then((r) => r.data);
}

// Creates a new organization for the current user (multipart form data)
export function createOrganization(data: FormData): Promise<OrgListItem> {
  return axios
    .post<OrgListItem>('cloud-api/organizations', data, {
      headers: { 'Content-Type': undefined },
    })
    .then((r) => r.data);
}

// Checks if a subdomain is available; throws AxiosError (409) if already taken
export function checkSubdomain(subdomain: string): Promise<SubdomainAvailability> {
  return axios
    .get<SubdomainAvailability>('cloud-api/organizations/check-subdomain', { params: { subdomain } })
    .then((r) => r.data);
}

// Fetches all nexus portal users for an organization
export function getOrgUsers(orgId: string): Promise<NexusUser[]> {
  return axios.get<NexusUser[]>(`cloud-api/organizations/${orgId}/users`).then((r) => r.data);
}

// Invites a user to the organization in nexus
export function inviteOrgUser(orgId: string, data: InviteUserFormData): Promise<NexusUser> {
  return axios.post<NexusUser>(`cloud-api/organizations/${orgId}/users/invite`, data).then((r) => r.data);
}
