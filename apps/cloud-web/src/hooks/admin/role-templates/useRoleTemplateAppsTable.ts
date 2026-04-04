import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplateAppsTableResponse } from '@/schemas/admin/role-templates';
import { getRoleTemplateAppsTable } from '../../../services/admin/role-templates.service';

export function roleTemplateAppsTableKey(versionId: string, roleTemplateId: string) {
  return ['admin', 'versions', versionId, 'role-templates', roleTemplateId, 'apps', 'table'] as const;
}

export function useRoleTemplateAppsTable(
  versionId: string,
  roleTemplateId: string,
  options?: Omit<UseQueryOptions<RoleTemplateAppsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RoleTemplateAppsTableResponse, AxiosError>({
    queryKey: roleTemplateAppsTableKey(versionId, roleTemplateId),
    queryFn: () => getRoleTemplateAppsTable(versionId, roleTemplateId),
    enabled: !!versionId && !!roleTemplateId,
    ...options,
  });
}
