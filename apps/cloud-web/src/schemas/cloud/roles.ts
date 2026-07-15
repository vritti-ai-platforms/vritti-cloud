import type { FeatureUnlocks, RevokedGrants, ScopeType, SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { z } from '@vritti/quantum-ui/zod';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  code: string;
  scope: ScopeType;
  siteType: SiteType | null;
  features: FeatureUnlocks;
  revoked?: RevokedGrants | null;
  isActive: boolean;
  assignedUserCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export function isDefaultRole(role: Pick<Role, 'code' | 'name'>, templateByCode: Map<string, RoleTemplate>): boolean {
  return templateByCode.get(role.code)?.name === role.name;
}

// Render-ready role sections assembled by the backend — the page renders these directly
export interface RoleTemplateRow {
  template: RoleTemplate;
  role: Role | null;
}

export interface RoleSiteTypeGroup {
  siteType: SiteType;
  templates: RoleTemplateRow[];
  customRoles: Role[];
}

export interface RoleScopeSection {
  scope: ScopeType;
  templates: RoleTemplateRow[];
  customRoles: Role[];
  siteTypeGroups: RoleSiteTypeGroup[];
}

// Extracts the flat template list from sections (for pickers / grant composition)
export function sectionTemplates(sections: RoleScopeSection[]): RoleTemplate[] {
  return sections
    .flatMap((s) => [...s.templates, ...s.siteTypeGroups.flatMap((g) => g.templates)])
    .map((row) => row.template);
}

// Extracts every role (enabled template instances + custom) from sections
export function sectionRoles(sections: RoleScopeSection[]): Role[] {
  return sections.flatMap((s) => {
    const rows = [...s.templates, ...s.siteTypeGroups.flatMap((g) => g.templates)];
    const templateRoles = rows.map((row) => row.role).filter((r): r is Role => r !== null);
    return [...templateRoles, ...s.customRoles, ...s.siteTypeGroups.flatMap((g) => g.customRoles)];
  });
}

export interface RoleTemplate {
  code: string;
  name: string;
  description?: string;
  scope: ScopeType;
  siteType: SiteType;
  features: FeatureUnlocks;
}

const featureUnlocksSchema = z.record(
  z.string(),
  z.object({ web: z.array(z.string()).optional(), mobile: z.array(z.string()).optional() }),
);

const revokedGrantsSchema = z.record(
  z.string(),
  z.object({
    web: z.array(z.string()).nullable().optional(),
    mobile: z.array(z.string()).nullable().optional(),
  }),
);

export const createRoleSchema = z.object({
  code: z.string().min(1, 'Base role is required'),
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  features: featureUnlocksSchema,
});

// Role "settings" form — name + description only
export const roleDetailsSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  features: featureUnlocksSchema.optional(),
  revoked: revokedGrantsSchema.optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type RoleDetailsFormData = z.infer<typeof roleDetailsSchema>;
type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  features: FeatureUnlocks;
}

export type UpdateRoleData = UpdateRoleFormData;
