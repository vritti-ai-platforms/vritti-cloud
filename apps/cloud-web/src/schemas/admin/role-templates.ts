import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export type RoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  industryId: string;
  industryName: string;
  permissionCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleTemplateDetail extends Role {
  appCount: number;
}

export interface FeatureWithPermissions {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  permissions: string[];
  appCodes: string[];
  appIds: string[];
}

export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  types: string[];
}

export interface PermissionEntry {
  featureId: string;
  type: string;
}

export interface RoleTemplateAppTableRow {
  appId: string;
  code: string;
  name: string;
  icon: string;
  isAssigned: boolean;
}

export type RoleTemplatesTableResponse = TableResponse<Role>;
export type RoleTemplateAppsTableResponse = TableResponse<RoleTemplateAppTableRow>;

export const createRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
  industryId: z.string().uuid('Please select an industry'),
  appIds: z.array(z.string().uuid()).min(1, 'Select at least one app'),
  versionId: z.string().uuid('App version is required'),
});

export const updateRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
  industryId: z.string().uuid('Please select an industry').optional(),
});

export const setPermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      featureId: z.string().uuid(),
      type: z.string(),
    }),
  ),
});

export type CreateRoleTemplateData = z.infer<typeof createRoleTemplateSchema>;
export type UpdateRoleTemplateData = z.infer<typeof updateRoleTemplateSchema>;
export type SetPermissionsData = z.infer<typeof setPermissionsSchema>;
