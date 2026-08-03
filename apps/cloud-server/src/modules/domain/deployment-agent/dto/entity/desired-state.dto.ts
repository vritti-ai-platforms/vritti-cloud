import { ApiProperty } from '@nestjs/swagger';

// DB provisioning mode for a deployment's Postgres (matches cloudapi.DBMode)
export const DesiredStateModeValues = {
  managed: 'managed' as const,
  external: 'external' as const,
};
export type DesiredStateMode = (typeof DesiredStateModeValues)[keyof typeof DesiredStateModeValues];

// HTTP edge mode: managed = agent runs nginx + wildcard cert; external = another fronts core (matches cloudapi.EdgeMode)
export const DesiredStateEdgeValues = {
  managed: 'managed' as const,
  external: 'external' as const,
};
export type DesiredStateEdge = (typeof DesiredStateEdgeValues)[keyof typeof DesiredStateEdgeValues];

// Resolved, pinned image references for a deployment's stack (matches cloudapi.Images)
export class ImagesDto {
  @ApiProperty() coreServer: string;
  @ApiProperty() commerceService: string;
  @ApiProperty() postgres: string;
  @ApiProperty() redis: string;
  @ApiProperty() nats: string;
  @ApiProperty() gitea: string;
  @ApiProperty() nginx: string;
}

// Optional stack features toggled per deployment (matches cloudapi.AddOns)
export class AddOnsDto {
  @ApiProperty() pgBackRest: boolean;
  @ApiProperty({
    description: 'pgBackRest retention — full backups kept (only meaningful when pgBackRest is on)',
    example: 4,
  })
  backupRetention: number;
  @ApiProperty() gitea: boolean;
}

// One static web artifact the managed edge serves off the wildcard origin (matches cloudapi.WebBundle).
// Path "" is the host SPA (core-web) at web root; a non-empty path is a module-federation remote
// extracted to that subdir so core-web loads it same-origin at /<path>/mf-manifest.json.
export class WebBundleDto {
  @ApiProperty({ example: 'ghcr.io/vritti-ai-platforms/core-web:latest-main' })
  artifact: string;

  @ApiProperty({ example: 'commerce-mf', description: '"" = web root; else the MF subdir (prodPath)' })
  path: string;
}

// Secret-store auth block — the secret half of the method rides sealedSecrets under secretProvider.* names (matches cloudapi.SecretProviderAuth)
export class SecretProviderAuthDto {
  @ApiProperty({
    example: 'universal',
    description: 'universal|token|aws-iam|gcp-iam|azure|kubernetes|oidc|jwt|ldap|oci',
  })
  method: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Non-secret auth params' })
  params: Record<string, string>;
}

// Per-deployment secret-store config the agent fetches runtime secrets from (matches cloudapi.SecretProvider)
export class SecretProviderDto {
  @ApiProperty({ example: 'infisical' })
  type: string;

  @ApiProperty({ example: 'https://infisical.vrittiai.com' })
  url: string;

  @ApiProperty() projectId: string;

  @ApiProperty({ example: 'apw1' })
  env: string;

  @ApiProperty({ type: SecretProviderAuthDto })
  auth: SecretProviderAuthDto;
}

// Desired running state the agent reconciles toward (matches cloudapi.DesiredState — exact JSON field names)
export class DesiredStateDto {
  @ApiProperty({ description: 'Monotonic generation; the agent skips reconcile when unchanged', example: 3 })
  generation: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ enum: DesiredStateModeValues, example: 'managed' })
  mode: DesiredStateMode;

  @ApiProperty({ example: 'apw1.vrittiai.com' })
  baseDomain: string;

  @ApiProperty({ enum: DesiredStateEdgeValues, example: 'managed' })
  edge: DesiredStateEdge;

  @ApiProperty({ example: 'ops@vrittiai.com', description: "Let's Encrypt registration email (cloud-owned)" })
  acmeEmail: string;

  @ApiProperty({ example: true, description: "Use the Let's Encrypt staging CA" })
  acmeStaging: boolean;

  @ApiProperty({ type: ImagesDto })
  images: ImagesDto;

  @ApiProperty({ type: AddOnsDto })
  addOns: AddOnsDto;

  @ApiProperty({ type: [WebBundleDto], description: 'Static web artifacts the managed edge serves off *.<base>' })
  webBundles: WebBundleDto[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Plaintext non-secret config' })
  config: Record<string, string>;

  @ApiProperty({
    type: SecretProviderDto,
    nullable: true,
    description: 'Secret-store config; the auth secret half arrives via sealedSecrets under secretProvider.* names',
  })
  secretProvider: SecretProviderDto | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'name → base64 sealed ciphertext (agent decrypts)',
  })
  sealedSecrets: Record<string, string>;
}
