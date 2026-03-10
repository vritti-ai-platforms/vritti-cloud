import { z } from 'zod';

export interface Plan {
  id: string;
  name: string;
  code: string;
  priceCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanData = z.infer<typeof createPlanSchema>;
export type UpdatePlanData = z.infer<typeof updatePlanSchema>;
