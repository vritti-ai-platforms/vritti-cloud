import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleTemplateDetail } from '@/schemas/admin/role-templates';
import { getRoleTemplate } from '../../../services/admin/role-templates.service';

export function roleTemplateQueryKey(versionId: string, id: string) {
  return ['admin', 'versions', versionId, 'role-templates', id] as const;
}

export function useRoleTemplate(versionId: string, id: string) {
  return useSuspenseQuery<RoleTemplateDetail, AxiosError>({
    queryKey: roleTemplateQueryKey(versionId, id),
    queryFn: () => getRoleTemplate(versionId, id),
  });
}
