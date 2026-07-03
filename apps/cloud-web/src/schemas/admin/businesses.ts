import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface Business {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  canDelete: boolean;
}

export type BusinessesResponse = TableResponse<Business>;

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  code: z.string().min(1, 'Business code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
});

export type CreateBusinessData = z.infer<typeof createBusinessSchema>;

export const updateBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  code: z.string().min(1, 'Business code is required').max(100, 'Code must be 100 characters or less'),
  description: z.string().optional(),
});

export type UpdateBusinessData = z.infer<typeof updateBusinessSchema>;
