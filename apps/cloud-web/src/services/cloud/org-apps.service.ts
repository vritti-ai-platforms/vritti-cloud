import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { OrgAppsResponse, PurchaseAddonData } from '@/schemas/cloud/org-apps';

// Fetches all apps available to the organization with their enabled status
export function getOrgApps(orgId: string): Promise<OrgAppsResponse> {
  return axios.get<OrgAppsResponse>(`cloud-api/organizations/${orgId}/apps`).then((r) => r.data);
}

// Enables an app for the organization
export function enableOrgApp({ orgId, appId }: { orgId: string; appId: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`cloud-api/organizations/${orgId}/apps/${appId}/enable`).then((r) => r.data);
}

// Disables an app for the organization
export function disableOrgApp({ orgId, appId }: { orgId: string; appId: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>(`cloud-api/organizations/${orgId}/apps/${appId}/disable`).then((r) => r.data);
}

// Purchases an addon app for selected business units
export function purchaseAddon({
  orgId,
  appId,
  data,
}: {
  orgId: string;
  appId: string;
  data: PurchaseAddonData;
}): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`cloud-api/organizations/${orgId}/apps/${appId}/purchase`, data)
    .then((r) => r.data);
}

// Cancels an addon app for a specific business unit
export function cancelAddon({
  orgId,
  appId,
  businessUnitId,
}: {
  orgId: string;
  appId: string;
  businessUnitId: string;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`cloud-api/organizations/${orgId}/apps/${appId}/business-units/${businessUnitId}`)
    .then((r) => r.data);
}
