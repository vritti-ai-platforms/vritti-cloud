import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from 'zod';

export type RoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  industryId: string | null;
  industryName: string | null;
  permissionCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export interface RoleDetail extends Role {
  appIds: string[];
  permissions: RolePermission[];
}

export interface RolePermission {
  featureId: string;
  featureCode: string;
  featureName: string;
  type: string;
}

// Feature with its available permission types and app associations
export interface FeatureWithPermissions {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  permissions: string[];
  appCodes: string[];
}

// Grouped permission entry returned by the role permissions endpoint
export interface GroupedPermission {
  featureCode: string;
  featureName: string;
  types: string[];
}

// Single permission entry for the save payload
export interface PermissionEntry {
  featureId: string;
  type: string;
}

export type RolesTableResponse = TableResponse<Role>;

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
  industryId: z.string().uuid().optional().or(z.literal('')),
  appIds: z.array(z.string().uuid()).min(1, 'Select at least one app'),
  versionId: z.string().uuid('App version is required'),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
  industryId: z.string().uuid().optional().or(z.literal('')),
  appIds: z.array(z.string().uuid()).min(1, 'Select at least one app').optional(),
});

export const setPermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      featureId: z.string().uuid(),
      type: z.string(),
    }),
  ),
});

export type CreateRoleData = z.infer<typeof createRoleSchema>;
export type UpdateRoleData = z.infer<typeof updateRoleSchema>;
export type SetPermissionsData = z.infer<typeof setPermissionsSchema>;
