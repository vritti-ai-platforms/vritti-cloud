import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BusinessUnit } from '@/schemas/cloud/org-business-units';
import { getOrgBusinessUnit } from '../../../services/cloud/org-business-units.service';

export const ORG_BU_DETAIL_QUERY_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId] as const;

// Fetches a single business unit by ID — suspends until data is ready
export function useOrgBusinessUnit(orgId: string, buId: string) {
  return useSuspenseQuery<BusinessUnit, AxiosError>({
    queryKey: ORG_BU_DETAIL_QUERY_KEY(orgId, buId),
    queryFn: () => getOrgBusinessUnit(orgId, buId),
  });
}
