import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessUnit } from '@/schemas/cloud/org-business-units';
import { getOrgBusinessUnit } from '../../../services/cloud/org-business-units.service';

export const ORG_BU_DETAIL_QUERY_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId] as const;

type UseOrgBusinessUnitOptions = Omit<UseQueryOptions<BusinessUnit, AxiosError>, 'queryKey' | 'queryFn'>;

// Fetches a single business unit by ID
export function useOrgBusinessUnit(orgId: string, buId: string, options?: UseOrgBusinessUnitOptions) {
  return useQuery<BusinessUnit, AxiosError>({
    queryKey: ORG_BU_DETAIL_QUERY_KEY(orgId, buId),
    queryFn: () => getOrgBusinessUnit(orgId, buId),
    enabled: !!orgId && !!buId,
    ...options,
  });
}
