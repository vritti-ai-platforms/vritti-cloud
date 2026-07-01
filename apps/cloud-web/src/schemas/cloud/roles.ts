import { z } from '@vritti/quantum-ui/zod';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';

export interface Role {
  id: string;
  name: string;
  description: string | null;
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
  features: FeatureUnlocks;
}

// Per-platform feature grant — the matrix field; mirrors FeatureUnlocks
const featureUnlocksSchema = z.record(
  z.string(),
  z.object({ web: z.array(z.string()).optional(), mobile: z.array(z.string()).optional() }),
);

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  features: featureUnlocksSchema,
  // Default (template-seeded) roles are read-only; custom roles are editable
  isLocked: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  features: featureUnlocksSchema.optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// The matrix field is part of the form now, so the submit payload IS the form data
export type CreateRoleData = CreateRoleFormData;
export type UpdateRoleData = UpdateRoleFormData;
