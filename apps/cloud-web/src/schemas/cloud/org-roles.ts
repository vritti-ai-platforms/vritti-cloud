import { z } from 'zod';

export type OrgRoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

export interface OrgRole {
  id: string;
  name: string;
  description: string | null;
  scope: OrgRoleScope;
  features: Record<string, string[]>;
  isLocked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Template for pre-configured roles
export interface RoleTemplate {
  name: string;
  description?: string;
  scope: OrgRoleScope;
  features: Record<string, string[]>;
}

// Single feature entry with its available permission types
export interface OrgPermissionFeature {
  code: string;
  name: string;
  permissions: string[];
}

// Permission data grouped by app for the permission picker
export interface OrgPermissionGroup {
  appCode: string;
  appName: string;
  features: OrgPermissionFeature[];
}

export const createOrgRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
});

export const updateOrgRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
});

// Form field types (features are managed separately in state)
export type CreateOrgRoleFormData = z.infer<typeof createOrgRoleSchema>;
export type UpdateOrgRoleFormData = z.infer<typeof updateOrgRoleSchema>;

// API payload types include features
export interface CreateOrgRoleData extends CreateOrgRoleFormData {
  features: Record<string, string[]>;
}

export interface UpdateOrgRoleData extends UpdateOrgRoleFormData {
  features?: Record<string, string[]>;
}
