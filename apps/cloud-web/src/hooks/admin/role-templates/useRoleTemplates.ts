import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplatesTableResponse } from '@/schemas/admin/role-templates';
import { getRoleTemplates } from '../../../services/admin/role-templates.service';

export const ROLE_TEMPLATES_QUERY_KEY = (versionId: string) => ['admin', 'versions', versionId, 'role-templates'] as const;

export function useRoleTemplates(
  versionId: string,
  options?: Omit<UseQueryOptions<RoleTemplatesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RoleTemplatesTableResponse, AxiosError>({
    queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId),
    queryFn: () => getRoleTemplates(versionId),
    ...options,
  });
}
