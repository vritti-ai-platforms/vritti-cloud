import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
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
