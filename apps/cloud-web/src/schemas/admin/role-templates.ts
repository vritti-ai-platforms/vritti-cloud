import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

type RoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  businessId: string;
  businessName: string;
  permissionCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleTemplateDetail extends Role {
  appCount: number;
  appIds: string[];
}

export interface FeaturePermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface FeatureWithPermissions {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  permissions: FeaturePermissionOption[];
  appCodes: string[];
  appIds: string[];
}

export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  permissions: FeaturePermissionOption[];
}

export type RoleTemplatesTableResponse = TableResponse<Role>;

export const createRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
  appIds: z.array(z.string().uuid()).min(1, 'Select at least one app'),
  versionId: z.string().uuid('App version is required'),
});

export const updateRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
  appIds: z.array(z.string().uuid()).optional(),
});

export const setPermissionsSchema = z.object({
  featurePermissionIds: z.array(z.string().uuid()),
});

export type CreateRoleTemplateData = z.infer<typeof createRoleTemplateSchema>;
export type UpdateRoleTemplateData = z.infer<typeof updateRoleTemplateSchema>;
export type SetPermissionsData = z.infer<typeof setPermissionsSchema>;
