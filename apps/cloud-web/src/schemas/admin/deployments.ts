import { z } from '@vritti/quantum-ui/zod';

type DeploymentStatus = 'active' | 'stopped' | 'provisioning';
type DeploymentType = 'shared' | 'dedicated';

export interface Deployment {
  id: string;
  name: string;
  url: string;
  regionId: string;
  cloudProviderId: string;
  status: DeploymentStatus;
  type: DeploymentType;
  version: string | null;
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
  url: z.string().url('Must be a valid URL').max(500),
  webhookSecret: z.string().min(8, 'Secret must be at least 8 characters').max(500),
  regionId: z.string().uuid('Please select a region'),
  cloudProviderId: z.string().uuid('Please select a cloud provider'),
  type: z.enum(['shared', 'dedicated'], { message: 'Please select a type' }),
  status: z.enum(['active', 'stopped', 'provisioning']).optional(),
  version: z.string().min(1, 'Version is required').max(50),
});

export const updateDeploymentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  url: z.string().url('Must be a valid URL').max(500).optional(),
  regionId: z.string().uuid().optional(),
  cloudProviderId: z.string().uuid().optional(),
  type: z.enum(['shared', 'dedicated']).optional(),
  status: z.enum(['active', 'stopped', 'provisioning']).optional(),
  version: z.string().max(50).optional().or(z.literal('')),
});

export type CreateDeploymentData = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentData = z.infer<typeof updateDeploymentSchema>;
