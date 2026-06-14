import { z } from '@vritti/quantum-ui/zod';

export interface Plan {
  id: string;
  name: string;
  code: string;
  content: string | null;
  businessId: string;
  businessName: string;
  usdAnchor: number | null;
  priceCount: number;
  marketCount: number;
  orgCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
  businessId: z.string().uuid('Please select a vertical'),
  // Optional USD reference anchor in minor units (cents).
  usdAnchor: z.number().int().nonnegative().nullable().optional(),
  content: z.string().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanData = z.infer<typeof createPlanSchema>;
export type UpdatePlanData = z.infer<typeof updatePlanSchema>;
