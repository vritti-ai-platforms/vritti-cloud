import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessFeaturePermission } from '@/schemas/admin/business-features';
import { getBusinessFeaturePermissions } from '@/services/admin/versions/businesses/features.service';

export const BUSINESS_FEATURE_PERMISSIONS_KEY = (versionId: string, businessId: string, featureId: string) =>
  ['admin', 'versions', versionId, 'businesses', businessId, 'features', featureId, 'permissions'] as const;

// Lazily fetches a feature's business-applicable permissions (enabled only when a feature is selected)
export function useBusinessFeaturePermissions(versionId: string, businessId: string, featureId: string | null) {
  return useQuery<BusinessFeaturePermission[], AxiosError>({
    queryKey: BUSINESS_FEATURE_PERMISSIONS_KEY(versionId, businessId, featureId ?? ''),
    queryFn: () => getBusinessFeaturePermissions(versionId, businessId, featureId ?? ''),
    enabled: !!versionId && !!businessId && !!featureId,
  });
}
