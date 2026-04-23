import { z } from 'zod';

export type BusinessUnitType = 'ORGANIZATION' | 'REGION' | 'FRANCHISEE' | 'BRANCH' | 'TEAM' | 'DEPARTMENT' | 'CUSTOM';

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  type: BusinessUnitType;
  parentId: string | null;
  parentName: string | null;
  depth: number;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  timezone: string | null;
  phone: string | null;
  appCodes: string[];
  childCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface BusinessUnitsResponse {
  result: BusinessUnit[];
}

export const createBusinessUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100, 'Code must be 100 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, underscores, and hyphens'),
  type: z.enum(['ORGANIZATION', 'REGION', 'FRANCHISEE', 'BRANCH', 'TEAM', 'DEPARTMENT', 'CUSTOM'], {
    message: 'Please select a type',
  }),
  parentId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().trim().min(1, 'Timezone is required').max(50),
  phone: z.string().max(20).optional(),
});

export const updateBusinessUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100)
    .regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, underscores, and hyphens')
    .optional(),
  type: z.enum(['ORGANIZATION', 'REGION', 'FRANCHISEE', 'BRANCH', 'TEAM', 'DEPARTMENT', 'CUSTOM']).optional(),
  parentId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

export type CreateBusinessUnitData = z.infer<typeof createBusinessUnitSchema>;
export type UpdateBusinessUnitData = z.infer<typeof updateBusinessUnitSchema>;
