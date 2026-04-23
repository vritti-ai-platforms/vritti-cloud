import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessUnitsResponse } from '@/schemas/cloud/org-business-units';
import { getOrgBusinessUnits } from '../../../services/cloud/org-business-units.service';

export const ORG_BU_QUERY_KEY = (orgId: string) => ['organizations', orgId, 'business-units'] as const;

type UseOrgBusinessUnitsOptions = Omit<UseQueryOptions<BusinessUnitsResponse, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches all business units for the organization
export function useOrgBusinessUnits(orgId: string, options?: UseOrgBusinessUnitsOptions) {
  return useQuery<BusinessUnitsResponse, AxiosError>({
    queryKey: ORG_BU_QUERY_KEY(orgId),
    queryFn: () => getOrgBusinessUnits(orgId),
    enabled: !!orgId,
    ...options,
  });
}
