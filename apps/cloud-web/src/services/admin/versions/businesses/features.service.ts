import { axios } from '@vritti/quantum-ui/axios';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { BusinessFeaturePermission, BusinessFeaturesTableResponse } from '@/schemas/admin/business-features';

// Fetches the features a business's apps include (with their apps + permission count) for the data table
export function getBusinessFeaturesTable(
  versionId: string,
  businessId: string,
): Promise<BusinessFeaturesTableResponse> {
  return axios
    .get<BusinessFeaturesTableResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/features/table`)
    .then((r) => r.data);
}

// Fetches a feature's permissions that apply to the business
export function getBusinessFeaturePermissions(
  versionId: string,
  businessId: string,
  featureId: string,
): Promise<BusinessFeaturePermission[]> {
  return axios
    .get<BusinessFeaturePermission[]>(
      `admin-api/versions/${versionId}/businesses/${businessId}/features/${featureId}/permissions`,
    )
    .then((r) => r.data);
}

// Pins a feature to a single app within a business (appId null removes it from the business)
export function setBusinessFeatureApp({
  versionId,
  businessId,
  featureId,
  data,
}: {
  versionId: string;
  businessId: string;
  featureId: string;
  data: { appId: string | null };
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/features/${featureId}/app`, data)
    .then((r) => r.data);
}

// Adds many features to a business at once, all pinned to one app
export function assignFeaturesToApp({
  versionId,
  businessId,
  appId,
  featureIds,
}: {
  versionId: string;
  businessId: string;
  appId: string;
  featureIds: string[];
}): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/features`, { appId, featureIds })
    .then((r) => r.data);
}

// Removes many features from a business at once (unassigns each from its app)
export function removeBusinessFeatures({
  versionId,
  businessId,
  featureIds,
}: {
  versionId: string;
  businessId: string;
  featureIds: string[];
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`admin-api/versions/${versionId}/businesses/${businessId}/features`, {
      data: { featureIds },
    })
    .then((r) => r.data);
}
