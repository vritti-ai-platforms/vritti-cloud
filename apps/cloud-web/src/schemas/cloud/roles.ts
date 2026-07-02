import { z } from '@vritti/quantum-ui/zod';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';
import type { RevokedGrants } from '@/schemas/cloud/role-grants';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  // The template this role builds on — effective grants = template ∪ features − revoked, composed at read time
  code: string;
  // featureCode → { web?: permCodes, mobile?: permCodes } — the role's ADDITIONS beyond the template
  features: FeatureUnlocks;
  // Grants inherited from the template that this role removes
  revoked?: RevokedGrants | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// A role with zero deltas is a "default" role that tracks its template exactly; deltas make it custom
export function isDefaultRole(role: Pick<Role, 'features' | 'revoked'>): boolean {
  return Object.keys(role.features ?? {}).length === 0 && Object.keys(role.revoked ?? {}).length === 0;
}

export interface RoleTemplate {
  code: string;
  name: string;
  description?: string;
  features: FeatureUnlocks;
}

// Per-platform feature grant — the matrix field; mirrors FeatureUnlocks
const featureUnlocksSchema = z.record(
  z.string(),
  z.object({ web: z.array(z.string()).optional(), mobile: z.array(z.string()).optional() }),
);

// Revoked grants — platform null revokes the whole platform membership, string[] revokes those codes
const revokedGrantsSchema = z.record(
  z.string(),
  z.object({
    web: z.array(z.string()).nullable().optional(),
    mobile: z.array(z.string()).nullable().optional(),
  }),
);

// Role creation — every role builds on a template (its code); a fresh role has zero deltas
export const createRoleSchema = z.object({
  code: z.string().min(1, 'Select a base role'),
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  features: featureUnlocksSchema,
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  features: featureUnlocksSchema.optional(),
  revoked: revokedGrantsSchema.optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// The matrix field is part of the form now, so the submit payload IS the form data
export type CreateRoleData = CreateRoleFormData;
export type UpdateRoleData = UpdateRoleFormData;
