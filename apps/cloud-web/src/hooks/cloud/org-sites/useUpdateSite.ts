import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateSiteData } from '@/schemas/cloud/org-sites';
import { updateOrgSite } from '@/services/cloud/org-sites.service';
import { ORG_STRUCTURE_QUERY_KEY } from '../org-structure/useOrgStructure';
import { ORG_SITES_QUERY_KEY } from './useOrgSites';

type UpdateSiteVars = { orgId: string; siteId: string; data: UpdateSiteData };
type UseUpdateSiteOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateSiteVars>, 'mutationFn'>;

// Updates a site and invalidates the site list
export function useUpdateSite(options?: UseUpdateSiteOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateSiteVars>({
    ...options,
    mutationFn: updateOrgSite,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_SITES_QUERY_KEY(vars.orgId) });
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
