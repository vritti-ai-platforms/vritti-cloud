import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { deleteOrgSite } from '@/services/cloud/org-sites.service';
import { ORG_STRUCTURE_QUERY_KEY } from '../org-structure/useOrgStructure';
import { ORG_SITES_QUERY_KEY } from './useOrgSites';

type DeleteSiteVars = { orgId: string; siteId: string };
type UseDeleteSiteOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, DeleteSiteVars>, 'mutationFn'>;

// Deletes a site and invalidates the site list
export function useDeleteSite(options?: UseDeleteSiteOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteSiteVars>({
    ...options,
    mutationFn: deleteOrgSite,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_SITES_QUERY_KEY(vars.orgId) });
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
