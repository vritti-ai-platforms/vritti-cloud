import { z, zodNumericField } from '@vritti/quantum-ui/zod';

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

// Component mode — 'managed' = the agent runs it; 'external' = something else provides it. Shared by
// the database and edge components; must byte-match the backend ComponentModeInputValues.
export const COMPONENT_MODE_VALUES = ['managed', 'external'] as const;
export type ComponentMode = (typeof COMPONENT_MODE_VALUES)[number];

export const COMPONENT_MODE_OPTIONS: { value: ComponentMode; label: string }[] = [
  { value: 'managed', label: 'Managed' },
  { value: 'external', label: 'External' },
];

// The one who-runs-it fork — must byte-match the backend DeploymentManagementTypeValues enum.
// 'managed' = Vritti's agent runs + observes the stack; 'manual' = customer self-hosts (cloud is
// licensing-only).
export const MANAGEMENT_TYPE_VALUES = ['managed', 'manual'] as const;
export type DeploymentManagementType = (typeof MANAGEMENT_TYPE_VALUES)[number];

export const MANAGEMENT_TYPE_OPTIONS: { value: DeploymentManagementType; label: string; description: string }[] = [
  {
    value: 'managed',
    label: 'Managed',
    description: 'Provisioned and operated by an agent on a cloud region and provider.',
  },
  {
    value: 'manual',
    label: 'Manual',
    description: 'Self-hosted deployment you run yourself. A signing key is issued at creation.',
  },
];

// Tenancy of the deployment — must byte-match the backend `tenantType` enum.
export const DEPLOYMENT_TENANT_TYPE_VALUES = ['shared', 'dedicated'] as const;
export type DeploymentTenantType = (typeof DEPLOYMENT_TENANT_TYPE_VALUES)[number];

export const DEPLOYMENT_TENANT_TYPE_OPTIONS: { value: DeploymentTenantType; label: string }[] = [
  { value: 'shared', label: 'Shared' },
  { value: 'dedicated', label: 'Dedicated' },
];

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

// The typed stack-component spec (deployments.spec jsonb). Absent components are omitted; a manual
// deployment carries { specVersion: 1, components: {} }.
export interface SpecCore {
  enabled: boolean;
}

export interface SpecDatabaseBackup {
  retention: number;
}

export interface SpecDatabase {
  mode: ComponentMode;
  backup?: SpecDatabaseBackup;
}

export interface SpecEdge {
  mode: ComponentMode;
  acmeEmail?: string;
}

export interface SpecGitea {
  enabled: boolean;
}

export interface DeploymentSpecComponents {
  core?: SpecCore;
  database?: SpecDatabase;
  edge?: SpecEdge;
  gitea?: SpecGitea;
  secretStore?: SecretProvider;
}

export interface DeploymentSpec {
  specVersion: number;
  components: DeploymentSpecComponents;
}

export interface Deployment {
  id: string;
  name: string;
  url: string;
  regionId: string;
  cloudProviderId: string;
  status: DeploymentStatus;
  tenantType: DeploymentTenantType;
  managementType: DeploymentManagementType;
  spec: DeploymentSpec;
  version: string | null;
  regionName?: string;
  regionCode?: string;
  cloudProviderName?: string;
  cloudProviderCode?: string;
  createdAt: string;
  updatedAt: string | null;
  organizationCount: number;
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

// One reconcile condition from the most recent heartbeat (Kubernetes-style status axis).
export interface Condition {
  type: 'Ready' | 'Reconciling' | 'Blocked' | 'Degraded';
  status: 'true' | 'false' | 'unknown';
  reason: string;
  message: string;
  component?: 'core' | 'database' | 'edge' | 'gitea' | 'secretStore';
  since: string;
}

// One service's latest reported runtime state, tagged by the component it belongs to.
export interface ServiceStatus {
  component: string;
  service: string;
  name: string;
  state: string;
  health: string;
  cpuPercent: number;
  memoryBytes: number;
}

// One append-only timeline event surfaced from the agent's reconcile transitions.
export interface DeploymentEvent {
  id: string;
  generation: number | null;
  level: string;
  component: string | null;
  reason: string;
  message: string;
  createdAt: string;
}

// Latest reported whole-VM resource usage (from the most recent heartbeat).
export interface HostMetrics {
  cpuPercent: number;
  memTotalBytes: number;
  memUsedBytes: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
}

// Pending DNS delegation the operator must add before the wildcard cert can be issued. name/target =
// the challenge CNAME; zone/nameserver/serverIp = the one-time zone delegation (`zone NS nameserver`
// + `nameserver A serverIp`). Null once the wildcard cert has issued.
export interface AcmeDelegation {
  name: string;
  target: string;
  zone: string;
  nameserver: string;
  serverIp: string;
}

export interface AgentStatus {
  deploymentId: string;
  enrolled: boolean;
  status: AgentEnrollmentStatus | null;
  agentVersion: string | null;
  lastHeartbeatAt: string | null;
  lastGeneration: number | null;
  desiredGeneration: number;
  deploymentPubKey: string | null;
  conditions: Condition[];
  services: ServiceStatus[];
  host: HostMetrics | null;
  certificates: Certificate[];
  delegation: AcmeDelegation | null;
}

// A newest-first page of a deployment's event timeline plus the cursor for the next (older) page.
export interface DeploymentEventsResponse {
  result: DeploymentEvent[];
  nextCursor: string | null;
}

// Create: an empty ACME email means "not set" — send undefined (omit from payload).
const acmeEmailField = z
  .string()
  .email('Must be a valid email')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const secretStoreField = z.object({
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

// Validates a secret-store config + its (optionally-required) secret values, adding issues at the
// nested components.secretStore / secretProviderSecrets form paths.
export function validateSecretProvider(
  provider: z.infer<typeof secretStoreField>,
  secrets: Record<string, string | undefined> | undefined,
  ctx: z.RefinementCtx,
  requireSecrets: boolean,
) {
  const baseFields: [keyof z.infer<typeof secretStoreField>, string][] = [
    ['type', provider.type],
    ['url', provider.url],
    ['projectId', provider.projectId],
    ['env', provider.env],
  ];
  for (const [key, value] of baseFields) {
    if (!value) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['components', 'secretStore', key], message: 'Required' });
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
        path: ['components', 'secretStore', 'auth', 'params', field.key],
        message: `${field.label} is required`,
      });
    }
  }
}

// Splits a form's secret-store config into the non-secret store config (clean params for the selected
// method) and the write-only secret values submitted at the top-level secretProviderSecrets key.
export function assembleSecretProvider(data: {
  components?: { secretStore?: SecretProvider };
  secretProviderSecrets?: Record<string, string | undefined>;
}): { secretStore?: SecretProvider; secretProviderSecrets?: Record<string, string> } {
  const provider = data.components?.secretStore;
  if (!provider) return { secretStore: undefined, secretProviderSecrets: undefined };
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
    secretStore: {
      type: provider.type,
      url: provider.url,
      projectId: provider.projectId,
      env: provider.env,
      auth: { method: provider.auth.method, params },
    },
    secretProviderSecrets: Object.keys(secrets).length > 0 ? secrets : undefined,
  };
}

const databaseComponentField = z
  .object({
    mode: z.enum(COMPONENT_MODE_VALUES),
    backup: z.object({ retention: zodNumericField({ integer: true, min: 1, max: 52 }) }).optional(),
  })
  .optional();

const edgeComponentField = z
  .object({
    mode: z.enum(COMPONENT_MODE_VALUES),
    acmeEmail: acmeEmailField,
  })
  .optional();

const componentsField = z
  .object({
    core: z.object({ enabled: z.boolean().optional() }).optional(),
    database: databaseComponentField,
    edge: edgeComponentField,
    gitea: z.object({ enabled: z.boolean() }).optional(),
    secretStore: secretStoreField.optional(),
  })
  .optional();

// Enforces the same component dependencies as the backend validateSpec: managed needs a secret store;
// a managed edge needs an ACME email; a database backup requires a managed database.
function refineComponents(
  data: { components?: z.infer<typeof componentsField>; secretProviderSecrets?: Record<string, string | undefined> },
  ctx: z.RefinementCtx,
  requireSecretStore: boolean,
) {
  const components = data.components;
  if (requireSecretStore && !components?.secretStore) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['components', 'secretStore'],
      message: 'Secret store is required',
    });
  } else if (components?.secretStore) {
    validateSecretProvider(components.secretStore, data.secretProviderSecrets, ctx, requireSecretStore);
  }
  if (components?.edge?.mode === 'managed' && !components.edge.acmeEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['components', 'edge', 'acmeEmail'],
      message: 'ACME email is required for a managed edge',
    });
  }
  if (components?.database?.backup && components.database.mode !== 'managed') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['components', 'database', 'backup'],
      message: 'Backups require a managed database',
    });
  }
}

export const createDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    url: z.string().url('Must be a valid URL').max(500),
    managementType: z.enum(MANAGEMENT_TYPE_VALUES),
    regionId: z.string().uuid('Please select a region').optional().or(z.literal('')),
    cloudProviderId: z.string().uuid('Please select a cloud provider').optional().or(z.literal('')),
    tenantType: z.enum(DEPLOYMENT_TENANT_TYPE_VALUES).optional(),
    status: z.enum(DEPLOYMENT_STATUS_VALUES).optional(),
    version: z.string().min(1, 'Version is required').max(50),
    components: componentsField,
    secretProviderSecrets: secretProviderSecretsField.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.managementType !== 'managed') return;
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
    // Secret store is no longer collected at create — it's a provisioning prerequisite entered in the
    // in-view setup flow. Only validate the components authored here (edge email, db backup).
    refineComponents(data, ctx, false);
  });

export const updateDeploymentSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    url: z.string().url('Must be a valid URL').max(500).optional(),
    regionId: z.string().uuid().optional(),
    cloudProviderId: z.string().uuid().optional(),
    tenantType: z.enum(DEPLOYMENT_TENANT_TYPE_VALUES).optional(),
    status: z.enum(DEPLOYMENT_STATUS_VALUES).optional(),
    version: z.string().max(50).optional().or(z.literal('')),
    components: componentsField,
    secretProviderSecrets: secretProviderSecretsField.optional(),
  })
  .superRefine((data, ctx) => refineComponents(data, ctx, false));

export type CreateDeploymentData = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentData = z.infer<typeof updateDeploymentSchema>;

// Service → component map (mirrors the agent + cloud-server): postgres → database; nginx, acme-dns →
// edge; gitea → gitea; everything else → core.
export const COMPONENT_KEYS = ['core', 'database', 'edge', 'gitea'] as const;
export type ComponentKey = (typeof COMPONENT_KEYS)[number];

// Filters the agent's reported services to those belonging to a component.
export function servicesForComponent(services: ServiceStatus[], component: ComponentKey): ServiceStatus[] {
  return services.filter((service) => service.component === component);
}
