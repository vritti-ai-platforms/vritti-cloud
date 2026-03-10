import { axios } from '@vritti/quantum-ui/axios';
import type { OrgListItem, PaginatedResponse, SubdomainAvailability } from '@/schemas/cloud/organizations';

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
