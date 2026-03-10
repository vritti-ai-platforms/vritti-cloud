import { z } from 'zod';

export enum OrgSize {
  s0_10 = '0-10',
  s10_20 = '10-20',
  s20_50 = '20-50',
  s50_100 = '50-100',
  s100_500 = '100-500',
  s500plus = '500+',
}

export enum OrgMemberRole {
  Owner = 'Owner',
  Admin = 'Admin',
}

export interface OrgListItem {
  id: string;
  name: string;
  subdomain: string;
  orgIdentifier: string;
  industryId: string;
  size: OrgSize;
  mediaId: string | null;
  planId: string | null;
  deploymentId: string | null;
  role: OrgMemberRole;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// Zod schema for create org form
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  subdomain: z
    .string()
    .min(1, 'URL is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  size: z.enum(Object.values(OrgSize) as [OrgSize, ...OrgSize[]], { message: 'Please select a size' }),
  industryId: z.string({ message: 'Please select an industry' }),
  industryName: z.string().optional(),
  regionId: z.string({ message: 'Please select a region' }).optional(),
  regionName: z.string().optional(),
  cloudProviderId: z.string({ message: 'Please select a provider' }).optional(),
  cloudProviderName: z.string().optional(),
  deploymentId: z.string({ message: 'Please select a deployment' }).optional(),
  deploymentName: z.string().optional(),
  planId: z.string({ message: 'Please select a plan' }).optional(),
  planName: z.string().optional(),
  planPrice: z.string().optional(),
  planCurrency: z.string().optional(),
  logo: z
    .instanceof(File)
    .refine((f) => f.size <= 10 * 1024 * 1024, 'File must be under 10MB')
    .optional(),
});

export type CreateOrgFormData = z.output<typeof createOrganizationSchema>;

export interface SubdomainAvailability {
  available: boolean;
}
