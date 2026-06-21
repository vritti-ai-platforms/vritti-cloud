import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessFeaturesTableResponse } from '@/schemas/admin/business-features';
import { getBusinessFeaturesTable } from '@/services/admin/versions/businesses/features.service';

export const BUSINESS_FEATURES_TABLE_KEY = (versionId: string, businessId: string) =>
  ['admin', 'versions', versionId, 'businesses', businessId, 'features', 'table'] as const;

// Fetches a business's features data table (server-stored filter/sort/pagination state)
export function useBusinessFeatures(versionId: string, businessId: string) {
  return useQuery<BusinessFeaturesTableResponse, AxiosError>({
    queryKey: BUSINESS_FEATURES_TABLE_KEY(versionId, businessId),
    queryFn: () => getBusinessFeaturesTable(versionId, businessId),
    enabled: !!versionId && !!businessId,
  });
}
