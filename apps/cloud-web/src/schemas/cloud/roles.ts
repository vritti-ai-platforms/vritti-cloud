import type { FeatureUnlocks, RevokedGrants } from '@vritti/quantum-ui/types/catalog-resolver';
import { z } from '@vritti/quantum-ui/zod';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  code: string;
  features: FeatureUnlocks;
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

export type CreateRoleData = CreateRoleFormData;
export type UpdateRoleData = UpdateRoleFormData;
