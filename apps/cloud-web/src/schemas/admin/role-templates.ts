import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';
import type {
  MatrixApp,
  MatrixFeature,
  MatrixGrant,
  MatrixPermissionOption,
  Platform as MatrixPlatform,
} from './permission-matrix';

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

// A role's apps are derived from the permissions it grants, so the detail view is just the role
export type RoleTemplateDetail = Role;

// Matrix shapes are shared with plan unlocks — see schemas/admin/permission-matrix
export type Platform = MatrixPlatform;
export type FeaturePermissionOption = MatrixPermissionOption;
export type RoleTemplateFeature = MatrixFeature;
export type RoleTemplateApp = MatrixApp;
export type RoleTemplateGrant = MatrixGrant;

// The full matrix payload: the role's apps (each with its features) + the complete current grant set
export interface RoleTemplatePermissionsResponse {
  apps: RoleTemplateApp[];
  grants: RoleTemplateGrant[];
}

export type RoleTemplatesTableResponse = TableResponse<Role>;

export const createRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
  versionId: z.string().uuid('App version is required'),
});

export const updateRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
});

export const setPermissionsSchema = z.object({
  grants: z.array(
    z.object({
      featurePermissionId: z.string().uuid(),
      platform: z.enum(['WEB', 'MOBILE']),
    }),
  ),
});

export type CreateRoleTemplateData = z.infer<typeof createRoleTemplateSchema>;
export type UpdateRoleTemplateData = z.infer<typeof updateRoleTemplateSchema>;
export type SetPermissionsData = z.infer<typeof setPermissionsSchema>;
