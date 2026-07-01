import type { TableResponse } from '@vritti/quantum-ui/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  businessId: string;
  businessName: string;
  permissionCount: number;
  createdAt: string;
  updatedAt: string | null;
}

// A role's apps are derived from the permissions it grants, so the detail view is just the role
export type RoleTemplateDetail = Role;

// Role-template matrix terminology = "grants" (a role GRANTS feature-permissions). Role-owned types (not shared).
export type Platform = 'WEB' | 'MOBILE';

export interface RolePermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
}

export interface RoleTemplateFeature {
  id: string;
  code: string;
  name: string;
  lucideIcon: string | null;
  permissions: RolePermissionOption[];
  platforms: Platform[];
}

// One per-platform grant = the role grants this feature on a platform, with the granted permission ids
export interface RoleTemplateGrant {
  featureId: string;
  platform: Platform;
  permissions: string[];
}

// One app (catalog) + the role's current grants nested under it
export interface RoleTemplateApp {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  features: RoleTemplateFeature[];
  grants: RoleTemplateGrant[];
}

export interface RoleTemplatePermissionsResponse {
  apps: RoleTemplateApp[];
}

export type RoleTemplatesTableResponse = TableResponse<Role>;

export const createRoleTemplateSchema = z.object({
  code: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().regex(/^[a-z][a-z0-9-]*$/, 'Single lowercase word (hyphens allowed)')),
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional(),
  versionId: z.string().uuid('App version is required'),
});

export const updateRoleTemplateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().optional(),
});

export const setPermissionsSchema = z.object({
  grants: z.array(
    z.object({
      featureId: z.string().uuid(),
      platform: z.enum(['WEB', 'MOBILE']),
      permissions: z.array(z.string().uuid()),
    }),
  ),
});

export type CreateRoleTemplateData = z.infer<typeof createRoleTemplateSchema>;
export type UpdateRoleTemplateData = z.infer<typeof updateRoleTemplateSchema>;
export type SetPermissionsData = z.infer<typeof setPermissionsSchema>;
