import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { CreateSiteData, Site, SitesResponse, UpdateSiteData } from '@/schemas/cloud/org-sites';

// Fetches all sites for the organization
export function getOrgSites(orgId: string): Promise<SitesResponse> {
  return axios.get<SitesResponse>(`cloud-api/organizations/${orgId}/sites`).then((r) => r.data);
}

// Fetches a single site by ID
export function getOrgSite(orgId: string, siteId: string): Promise<Site> {
  return axios.get<Site>(`cloud-api/organizations/${orgId}/sites/${siteId}`).then((r) => r.data);
}

// Creates a new site
export function createOrgSite({ orgId, data }: { orgId: string; data: CreateSiteData }): Promise<CreateResponse<Site>> {
  return axios.post<CreateResponse<Site>>(`cloud-api/organizations/${orgId}/sites`, data).then((r) => r.data);
}

// Updates a site
export function updateOrgSite({
  orgId,
  siteId,
  data,
}: {
  orgId: string;
  siteId: string;
  data: UpdateSiteData;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`cloud-api/organizations/${orgId}/sites/${siteId}`, data).then((r) => r.data);
}

// Deletes a site
export function deleteOrgSite({ orgId, siteId }: { orgId: string; siteId: string }): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`cloud-api/organizations/${orgId}/sites/${siteId}`).then((r) => r.data);
}
