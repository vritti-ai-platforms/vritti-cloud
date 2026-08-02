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

// Canonical deployment database mode values — must byte-match the backend deployment `mode` enum
// (apps/cloud-server). 'managed' = agent runs its own Postgres; 'external' = agent connects to an
// existing DB whose creds live in the deployment's secret store.
export const DEPLOYMENT_DB_MODE_VALUES = ['managed', 'external'] as const;
export type DeploymentDbMode = (typeof DEPLOYMENT_DB_MODE_VALUES)[number];

export const DEPLOYMENT_DB_MODE_OPTIONS: { value: DeploymentDbMode; label: string }[] = [
  { value: 'managed', label: 'Managed' },
  { value: 'external', label: 'External' },
];

// Canonical deployment edge values — must byte-match the backend deployment `edge` enum.
// 'managed' = the agent runs nginx + terminates TLS (ACME) for the configured domains;
// 'external' = TLS/routing is handled outside the agent (an existing ingress/load balancer).
export const DEPLOYMENT_EDGE_VALUES = ['managed', 'external'] as const;
export type DeploymentEdgeMode = (typeof DEPLOYMENT_EDGE_VALUES)[number];

export const DEPLOYMENT_EDGE_OPTIONS: { value: DeploymentEdgeMode; label: string }[] = [
  { value: 'managed', label: 'Managed' },
  { value: 'external', label: 'External' },
];

// Canonical deployment type values — must byte-match the backend deployment `type` enum.
// 'deployed' = an edge fronts core and serves it on `api.<host>`; 'local' = core answers directly
// on the deployment url (dev tunnel, or core on its own port) with no `api.` host to resolve.
export const DEPLOYMENT_TYPE_VALUES = ['deployed', 'local'] as const;
export type DeploymentType = (typeof DEPLOYMENT_TYPE_VALUES)[number];

export const DEPLOYMENT_TYPE_OPTIONS: { value: DeploymentType; label: string }[] = [
  { value: 'deployed', label: 'Deployed' },
  { value: 'local', label: 'Local' },
];

// Tenancy of the deployment — must byte-match the backend `tenantType` enum.
export const DEPLOYMENT_TENANT_TYPE_VALUES = ['shared', 'dedicated'] as const;
export type DeploymentTenantType = (typeof DEPLOYMENT_TENANT_TYPE_VALUES)[number];

export const DEPLOYMENT_TENANT_TYPE_OPTIONS: { value: DeploymentTenantType; label: string }[] = [
  { value: 'shared', label: 'Shared' },
  { value: 'dedicated', label: 'Dedicated' },
];

type DeploymentManagementMode = 'manual' | 'agent';

export interface Domain {
  host: string;
  upstream: string;
}

export const SECRET_AUTH_METHOD_VALUES = [
  'universal',
  'token',
  'aws-iam',
  'gcp-id-token',
  'gcp-iam',
  'azure',
  'kubernetes',
  'kubernetes-token',
  'oidc',
  'jwt',
  'ldap',
  'oci',
] as const;

export type SecretAuthMethod = (typeof SECRET_AUTH_METHOD_VALUES)[number];

export interface SecretProviderAuth {
  method: SecretAuthMethod;
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

export const SECRET_AUTH_METHODS: { value: SecretAuthMethod; label: string }[] = [
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
];

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
  mode: DeploymentDbMode;
  edge: DeploymentEdgeMode;
  addonPgbackrest: boolean;
  addonGitea: boolean;
  regionId: string;
  cloudProviderId: string;
  status: DeploymentStatus;
  tenantType: DeploymentTenantType;
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
  .or(z.literal('').transform(() => null))
  .optional();

const domainsField = z.array(
  z.object({
    host: z.string().min(1, 'Host is required'),
    upstream: z.string().min(1, 'Upstream is required'),
  }),
);

export const secretProviderField = z.object({
  type: z.string(),
  url: z.string(),
  projectId: z.string(),
  env: z.string(),
  auth: z.object({
    method: z.enum(SECRET_AUTH_METHOD_VALUES),
    params: z.record(z.string(), z.string()),
  }),
});

// Secret values are optional per key: a blank PasswordField (e.g. "leave blank to keep existing")
// yields undefined, and required-ness is enforced by validateSecretProvider, not the record itself.
export const secretProviderSecretsField = z.record(z.string(), z.string().optional());

export function validateSecretProvider(
  provider: z.infer<typeof secretProviderField>,
  secrets: Record<string, string | undefined> | undefined,
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
  const fields = SECRET_AUTH_METHOD_FIELDS[provider.auth.method] ?? [];
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
  secretProviderSecrets?: Record<string, string | undefined>;
}): { secretProvider?: SecretProvider; secretProviderSecrets?: Record<string, string> } {
  const provider = data.secretProvider;
  if (!provider) return { secretProvider: undefined, secretProviderSecrets: undefined };
  const fields = SECRET_AUTH_METHOD_FIELDS[provider.auth.method] ?? [];
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
    mode: z.enum(DEPLOYMENT_DB_MODE_VALUES).optional(),
    edge: z.enum(DEPLOYMENT_EDGE_VALUES).optional(),
    addonPgbackrest: z.boolean().optional(),
    addonGitea: z.boolean().optional(),
    regionId: z.string().uuid('Please select a region').optional().or(z.literal('')),
    cloudProviderId: z.string().uuid('Please select a cloud provider').optional().or(z.literal('')),
    tenantType: z.enum(DEPLOYMENT_TENANT_TYPE_VALUES).optional(),
    type: z.enum(DEPLOYMENT_TYPE_VALUES).optional(),
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
    // Agent-managed deployments must declare a secret store — the agent sources runtime secrets from it.
    if (!data.secretProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secretProvider'],
        message: 'Secret store is required',
      });
    } else {
      validateSecretProvider(data.secretProvider, data.secretProviderSecrets, ctx, true);
    }
    // Managed edge terminates TLS for the configured hosts, so at least one domain is required.
    if ((data.edge ?? 'managed') === 'managed' && data.domains.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['domains'],
        message: 'Add at least one domain for a managed edge',
      });
    }
  });

export const updateDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    url: z.string().url('Must be a valid URL').max(500).optional(),
    mode: z.enum(DEPLOYMENT_DB_MODE_VALUES).optional(),
    edge: z.enum(DEPLOYMENT_EDGE_VALUES).optional(),
    addonPgbackrest: z.boolean().optional(),
    addonGitea: z.boolean().optional(),
    regionId: z.string().uuid().optional(),
    cloudProviderId: z.string().uuid().optional(),
    tenantType: z.enum(DEPLOYMENT_TENANT_TYPE_VALUES).optional(),
    type: z.enum(DEPLOYMENT_TYPE_VALUES).optional(),
    status: z.enum(DEPLOYMENT_STATUS_VALUES).optional(),
    version: z.string().max(50).optional().or(z.literal('')),
    acmeEmail: acmeEmailUpdateField,
    domains: domainsField.optional(),
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
