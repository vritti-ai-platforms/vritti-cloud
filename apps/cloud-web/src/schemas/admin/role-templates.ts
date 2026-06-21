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

export type Platform = 'WEB' | 'MOBILE';

export interface FeaturePermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
}

// One feature row in the matrix (layer 2) — its permissions + the platforms it has a route on
export interface RoleTemplateFeature {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  permissions: FeaturePermissionOption[];
  platforms: Platform[];
}

// One app (layer 1) with the features it owns
export interface RoleTemplateApp {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  features: RoleTemplateFeature[];
}

// One platform-scoped grant
export interface RoleTemplateGrant {
  featurePermissionId: string;
  platform: Platform;
}

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
