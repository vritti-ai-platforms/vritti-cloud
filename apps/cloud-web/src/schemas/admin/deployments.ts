import { z } from 'zod';

export type DeploymentStatus = 'active' | 'stopped' | 'provisioning';
export type DeploymentType = 'shared' | 'dedicated';

export interface Deployment {
  id: string;
  name: string;
  nexusUrl: string;
  regionId: string;
  cloudProviderId: string;
  status: DeploymentStatus;
  type: DeploymentType;
  regionName?: string;
  regionCode?: string;
  cloudProviderName?: string;
  cloudProviderCode?: string;
  createdAt: string;
  updatedAt: string | null;
  organizationCount?: number;
}

export const createDeploymentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  nexusUrl: z.string().url('Must be a valid URL').max(500),
  webhookSecret: z.string().min(8, 'Secret must be at least 8 characters').max(500),
  regionId: z.string().uuid('Please select a region'),
  cloudProviderId: z.string().uuid('Please select a cloud provider'),
  type: z.enum(['shared', 'dedicated'], { message: 'Please select a type' }),
  status: z.enum(['active', 'stopped', 'provisioning']).optional(),
});

export const updateDeploymentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  nexusUrl: z.string().url('Must be a valid URL').max(500).optional(),
  regionId: z.string().uuid().optional(),
  cloudProviderId: z.string().uuid().optional(),
  type: z.enum(['shared', 'dedicated']).optional(),
  status: z.enum(['active', 'stopped', 'provisioning']).optional(),
});

export const assignPlanSchema = z.object({
  planId: z.string().uuid('Please select a plan'),
  industryId: z.string().uuid('Please select an industry'),
});

export type CreateDeploymentData = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentData = z.infer<typeof updateDeploymentSchema>;
export type AssignPlanData = z.infer<typeof assignPlanSchema>;

export interface DeploymentPlanAssignmentIndustry {
  industryId: string;
  industryName: string;
  price: string | null;
  currency: string | null;
  isAssigned: boolean;
}

export interface DeploymentPlanAssignment {
  planId: string;
  planName: string;
  planCode: string;
  industries: DeploymentPlanAssignmentIndustry[];
}
