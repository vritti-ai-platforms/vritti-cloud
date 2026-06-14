import { z } from '@vritti/quantum-ui/zod';

type OrgRoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

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

export interface RoleTemplate {
  name: string;
  description?: string;
  scope: OrgRoleScope;
  features: Record<string, string[]>;
}

interface OrgPermissionFeature {
  code: string;
  name: string;
  permissions: string[];
}

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

export type CreateOrgRoleFormData = z.infer<typeof createOrgRoleSchema>;
type UpdateOrgRoleFormData = z.infer<typeof updateOrgRoleSchema>;

export interface CreateOrgRoleData extends CreateOrgRoleFormData {
  features: Record<string, string[]>;
}

export interface UpdateOrgRoleData extends UpdateOrgRoleFormData {
  features?: Record<string, string[]>;
}
