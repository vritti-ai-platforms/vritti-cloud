import { z, zodCodeField } from '@vritti/quantum-ui/zod';

export interface Plan {
  id: string;
  name: string;
  code: string;
  content: string | null;
  businessId: string;
  businessName: string;
  priceCount: number;
  countryCount: number;
  orgCount: number;
  isCustom: boolean;
  attachedOrgName: string | null;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: zodCodeField({ max: 100 }),
  isCustom: z.boolean().optional(),
  // Required for standard plans; for custom plans the business is derived from the attached org.
  businessId: z.string().uuid().optional(),
  // Required when isCustom — the org this bespoke plan is attached to.
  organizationId: z.string().uuid().optional(),
  // Blank = unlimited.
  maxSites: z.number().int().nonnegative().optional(),
  content: z.string().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanData = z.infer<typeof createPlanSchema>;
export type UpdatePlanData = z.infer<typeof updatePlanSchema>;
