import { z } from '@vritti/quantum-ui/zod';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';

type OrgRoleScope = 'GLOBAL' | 'SUBTREE' | 'SINGLE_BU';

export interface OrgRole {
  id: string;
  name: string;
  description: string | null;
  scope: OrgRoleScope;
  // featureCode → { web?: permCodes, mobile?: permCodes } — per-platform grant (mirrors the snapshot/role webhook)
  features: FeatureUnlocks;
  isLocked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleTemplate {
  name: string;
  description?: string;
  scope: OrgRoleScope;
  features: FeatureUnlocks;
}

// Per-platform feature grant — the matrix field; mirrors FeatureUnlocks
const featureUnlocksSchema = z.record(
  z.string(),
  z.object({ web: z.array(z.string()).optional(), mobile: z.array(z.string()).optional() }),
);

export const createOrgRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU'], { message: 'Please select a scope' }),
  features: featureUnlocksSchema,
});

export const updateOrgRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  scope: z.enum(['GLOBAL', 'SUBTREE', 'SINGLE_BU']).optional(),
  features: featureUnlocksSchema.optional(),
});

export type CreateOrgRoleFormData = z.infer<typeof createOrgRoleSchema>;
type UpdateOrgRoleFormData = z.infer<typeof updateOrgRoleSchema>;

// The matrix field is part of the form now, so the submit payload IS the form data
export type CreateOrgRoleData = CreateOrgRoleFormData;
export type UpdateOrgRoleData = UpdateOrgRoleFormData;
