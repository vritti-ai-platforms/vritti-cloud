import { z } from '@vritti/quantum-ui/zod';

type DeploymentStatus = 'active' | 'stopped' | 'provisioning';
type DeploymentType = 'shared' | 'dedicated';
type DeploymentManagementMode = 'manual' | 'agent';

export interface Deployment {
  id: string;
  name: string;
  url: string;
  managementMode: DeploymentManagementMode;
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
  publicKey?: string;
  hasSigningKey: boolean;
  catalogSynced: boolean;
  lastPushedHash?: string | null;
}

export interface DeploymentSigningKey {
  deploymentId: string;
  publicKey: string;
}

export const createDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    url: z.string().url('Must be a valid URL').max(500),
    managementMode: z.enum(['manual', 'agent']),
    regionId: z.string().uuid('Please select a region').optional().or(z.literal('')),
    cloudProviderId: z.string().uuid('Please select a cloud provider').optional().or(z.literal('')),
    type: z.enum(['shared', 'dedicated']).optional(),
    status: z.enum(['active', 'stopped', 'provisioning']).optional(),
    version: z.string().min(1, 'Version is required').max(50),
  })
  .superRefine((data, ctx) => {
    if (data.managementMode !== 'agent') return;
    if (!data.regionId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['regionId'], message: 'Please select a region' });
    }
    if (!data.cloudProviderId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cloudProviderId'],
        message: 'Please select a cloud provider',
      });
    }
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
