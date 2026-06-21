import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplatesTableResponse } from '@/schemas/admin/role-templates';
import { getRoleTemplates } from '@/services/admin/versions/businesses/role-templates.service';

export const ROLE_TEMPLATES_QUERY_KEY = (versionId: string, businessId: string) =>
  ['admin', 'versions', versionId, 'businesses', businessId, 'role-templates'] as const;

// Fetches a business's role templates for the data table
export function useRoleTemplates(
  versionId: string,
  businessId: string,
  options?: Omit<UseQueryOptions<RoleTemplatesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RoleTemplatesTableResponse, AxiosError>({
    queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId, businessId),
    queryFn: () => getRoleTemplates(versionId, businessId),
    enabled: !!businessId,
    ...options,
  });
}
