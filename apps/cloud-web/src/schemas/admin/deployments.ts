import { z } from '@vritti/quantum-ui/zod';

// Canonical deployment status values — must byte-match the backend DeploymentStatusValues enum
// (apps/cloud-server/src/db/schema/enums.ts). Capital-P 'Provisioning' is intentional.
export const DEPLOYMENT_STATUS_VALUES = ['active', 'stopped', 'Provisioning'] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUS_VALUES)[number];

export const DEPLOYMENT_STATUS_OPTIONS: { value: DeploymentStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'Provisioning', label: 'Provisioning' },
];

export const DEPLOYMENT_STATUS_VARIANT: Record<DeploymentStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  Provisioning: 'warning',
  stopped: 'secondary',
};

type DeploymentType = 'shared' | 'dedicated';
type DeploymentManagementMode = 'manual' | 'agent';

export interface Domain {
  host: string;
  upstream: string;
}

export interface SecretProviderAuth {
  method: string;
  params: Record<string, string>;
}

export interface SecretProvider {
  type: string;
  url: string;
  projectId: string;
  env: string;
  auth: SecretProviderAuth;
}

export interface SecretAuthField {
  key: string;
  label: string;
  secret: boolean;
}

export const SECRET_PROVIDER_TYPES = [{ value: 'infisical', label: 'Infisical' }] as const;

export const SECRET_AUTH_METHODS = [
  { value: 'universal', label: 'Universal Auth' },
  { value: 'token', label: 'Token' },
  { value: 'aws-iam', label: 'AWS IAM' },
  { value: 'gcp-id-token', label: 'GCP ID Token' },
  { value: 'gcp-iam', label: 'GCP IAM' },
  { value: 'azure', label: 'Azure' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'kubernetes-token', label: 'Kubernetes Token' },
  { value: 'oidc', label: 'OIDC' },
  { value: 'jwt', label: 'JWT' },
  { value: 'ldap', label: 'LDAP' },
  { value: 'oci', label: 'OCI' },
] as const;

export type SecretAuthMethod = (typeof SECRET_AUTH_METHODS)[number]['value'];

export const SECRET_AUTH_METHOD_FIELDS: Record<SecretAuthMethod, SecretAuthField[]> = {
  universal: [
    { key: 'clientId', label: 'Client ID', secret: false },
    { key: 'clientSecret', label: 'Client Secret', secret: true },
  ],
  token: [{ key: 'token', label: 'Token', secret: true }],
  'aws-iam': [{ key: 'identityId', label: 'Identity ID', secret: false }],
  'gcp-id-token': [{ key: 'identityId', label: 'Identity ID', secret: false }],
  'gcp-iam': [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'serviceAccountKeyFilePath', label: 'Service Account Key File Path', secret: false },
  ],
  azure: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'resource', label: 'Resource', secret: false },
  ],
  kubernetes: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'serviceAccountTokenPath', label: 'Service Account Token Path', secret: false },
  ],
  'kubernetes-token': [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'serviceAccountToken', label: 'Service Account Token', secret: true },
  ],
  oidc: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'jwt', label: 'JWT', secret: true },
  ],
  jwt: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'jwt', label: 'JWT', secret: true },
  ],
  ldap: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'username', label: 'Username', secret: false },
    { key: 'password', label: 'Password', secret: true },
  ],
  oci: [
    { key: 'identityId', label: 'Identity ID', secret: false },
    { key: 'fingerprint', label: 'Fingerprint', secret: false },
    { key: 'userId', label: 'User ID', secret: false },
    { key: 'tenancyId', label: 'Tenancy ID', secret: false },
    { key: 'region', label: 'Region', secret: false },
    { key: 'privateKey', label: 'Private Key', secret: true },
    { key: 'passphrase', label: 'Passphrase', secret: true },
  ],
};

export const DEFAULT_SECRET_PROVIDER: SecretProvider = {
  type: 'infisical',
  url: '',
  projectId: '',
  env: '',
  auth: { method: 'universal', params: {} },
};

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
  acmeEmail: string | null;
  domains: Domain[];
  secretProvider: SecretProvider | null;
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

export interface EnrollToken {
  token: string;
  expiresAt: string;
  deploymentPubKey: string;
  cloudApiUrl: string;
}

type AgentEnrollmentStatus = 'pending' | 'enrolled' | 'revoked';

export interface Certificate {
  host: string;
  notAfter: string;
  issuedAt: string;
}

export interface AgentStatus {
  deploymentId: string;
  enrolled: boolean;
  status: AgentEnrollmentStatus | null;
  agentVersion: string | null;
  lastHeartbeatAt: string | null;
  lastPhase: string | null;
  lastMessage: string | null;
  lastGeneration: number | null;
  desiredGeneration: number;
  giteaProvisioned: boolean;
  deploymentPubKey: string | null;
  certificates: Certificate[];
}

// Create: an empty ACME email means "not set" — send undefined (omit from payload).
const acmeEmailCreateField = z
  .string()
  .email('Must be a valid email')
  .optional()
  .or(z.literal('').transform(() => undefined));

// Edit: an empty ACME email means "clear it" — send null so the backend nullifies a previously-set value.
const acmeEmailUpdateField = z
  .string()
  .email('Must be a valid email')
  .nullable()
  .or(z.literal('').transform(() => null));

const domainsField = z.array(
  z.object({
    host: z.string().min(1, 'Host is required'),
    upstream: z.string().min(1, 'Upstream is required'),
  }),
);

const secretProviderField = z.object({
  type: z.string(),
  url: z.string(),
  projectId: z.string(),
  env: z.string(),
  auth: z.object({
    method: z.string(),
    params: z.record(z.string(), z.string()),
  }),
});

const secretProviderSecretsField = z.record(z.string(), z.string());

function validateSecretProvider(
  provider: z.infer<typeof secretProviderField>,
  secrets: Record<string, string> | undefined,
  ctx: z.RefinementCtx,
  requireSecrets: boolean,
) {
  const baseFields: [keyof z.infer<typeof secretProviderField>, string][] = [
    ['type', provider.type],
    ['url', provider.url],
    ['projectId', provider.projectId],
    ['env', provider.env],
  ];
  for (const [key, value] of baseFields) {
    if (!value) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['secretProvider', key], message: 'Required' });
    }
  }
  const fields = SECRET_AUTH_METHOD_FIELDS[provider.auth.method as SecretAuthMethod] ?? [];
  for (const field of fields) {
    if (field.secret) {
      if (requireSecrets && !secrets?.[field.key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secretProviderSecrets', field.key],
          message: `${field.label} is required`,
        });
      }
    } else if (!provider.auth.params?.[field.key]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secretProvider', 'auth', 'params', field.key],
        message: `${field.label} is required`,
      });
    }
  }
}

export function assembleSecretProvider(data: {
  secretProvider?: SecretProvider;
  secretProviderSecrets?: Record<string, string>;
}): { secretProvider?: SecretProvider; secretProviderSecrets?: Record<string, string> } {
  const provider = data.secretProvider;
  if (!provider) return { secretProvider: undefined, secretProviderSecrets: undefined };
  const fields = SECRET_AUTH_METHOD_FIELDS[provider.auth.method as SecretAuthMethod] ?? [];
  const params: Record<string, string> = {};
  const secrets: Record<string, string> = {};
  for (const field of fields) {
    if (field.secret) {
      const value = data.secretProviderSecrets?.[field.key];
      if (value) secrets[field.key] = value;
    } else {
      const value = provider.auth.params?.[field.key];
      if (value) params[field.key] = value;
    }
  }
  return {
    secretProvider: {
      type: provider.type,
      url: provider.url,
      projectId: provider.projectId,
      env: provider.env,
      auth: { method: provider.auth.method, params },
    },
    secretProviderSecrets: Object.keys(secrets).length > 0 ? secrets : undefined,
  };
}

export const createDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    url: z.string().url('Must be a valid URL').max(500),
    managementMode: z.enum(['manual', 'agent']),
    regionId: z.string().uuid('Please select a region').optional().or(z.literal('')),
    cloudProviderId: z.string().uuid('Please select a cloud provider').optional().or(z.literal('')),
    type: z.enum(['shared', 'dedicated']).optional(),
    status: z.enum(DEPLOYMENT_STATUS_VALUES).optional(),
    version: z.string().min(1, 'Version is required').max(50),
    acmeEmail: acmeEmailCreateField,
    domains: domainsField,
    secretProvider: secretProviderField.optional(),
    secretProviderSecrets: secretProviderSecretsField.optional(),
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
    if (data.secretProvider) {
      validateSecretProvider(data.secretProvider, data.secretProviderSecrets, ctx, true);
    }
  });

export const updateDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    url: z.string().url('Must be a valid URL').max(500).optional(),
    regionId: z.string().uuid().optional(),
    cloudProviderId: z.string().uuid().optional(),
    type: z.enum(['shared', 'dedicated']).optional(),
    status: z.enum(DEPLOYMENT_STATUS_VALUES).optional(),
    version: z.string().max(50).optional().or(z.literal('')),
    acmeEmail: acmeEmailUpdateField,
    domains: domainsField,
    secretProvider: secretProviderField.optional(),
    secretProviderSecrets: secretProviderSecretsField.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.secretProvider) {
      validateSecretProvider(data.secretProvider, data.secretProviderSecrets, ctx, false);
    }
  });

export type CreateDeploymentData = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentData = z.infer<typeof updateDeploymentSchema>;
