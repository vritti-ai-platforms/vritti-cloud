import { z } from 'zod';

export interface IndustryApp {
  appId: string;
  appCode: string;
  appName: string;
  isRecommended: boolean;
  createdAt: string;
}

export const assignIndustryAppSchema = z.object({
  appId: z.string().uuid('Please select an app'),
  isRecommended: z.boolean().optional(),
});

export const updateIndustryAppSchema = z.object({
  isRecommended: z.boolean().optional(),
});

export type AssignIndustryAppData = z.infer<typeof assignIndustryAppSchema>;
export type UpdateIndustryAppData = z.infer<typeof updateIndustryAppSchema>;
