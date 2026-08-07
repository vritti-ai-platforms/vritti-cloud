import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Component mode: managed = agent runs it; external = something else provides it (matches cloudapi component modes)
export const ComponentModeValues = {
  managed: 'managed' as const,
  external: 'external' as const,
};
export type ComponentMode = (typeof ComponentModeValues)[keyof typeof ComponentModeValues];

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

// One static web artifact the managed edge serves off the wildcard origin (matches cloudapi.WebBundle).
// Path "" is the host SPA (core-web) at web root; a non-empty path is a module-federation remote
// extracted to that subdir so core-web loads it same-origin at /<path>/mf-manifest.json.
export class WebBundleDto {
  @ApiProperty({ example: 'ghcr.io/vritti-ai-platforms/core-web:latest-main' })
  artifact: string;

  @ApiProperty({ example: 'commerce-mf', description: '"" = web root; else the MF subdir (prodPath)' })
  path: string;
}

// Secret-store auth block — the secret half of the method rides sealedSecrets under secretStore.* names (matches cloudapi.SecretProviderAuth)
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

// The core stack component — the agent runs core-server/commerce/nats/redis (matches cloudapi.CoreComponent)
export class CoreComponentDto {
  @ApiProperty({ example: true })
  enabled: boolean;
}

// pgBackRest backup config for the managed database (matches cloudapi.DatabaseBackup)
export class DatabaseBackupDto {
  @ApiProperty({ description: 'Full backups kept (repo*-retention-full)', example: 4 })
  retention: number;
}

// The database component — managed = agent runs its own Postgres; external = agent connects to an existing DB (matches cloudapi.DatabaseComponent)
export class DatabaseComponentDto {
  @ApiProperty({ enum: ComponentModeValues, example: 'managed' })
  mode: ComponentMode;

  @ApiPropertyOptional({ type: DatabaseBackupDto, description: 'pgBackRest config — only valid when mode=managed' })
  backup?: DatabaseBackupDto;
}

// The HTTP edge component — managed = agent runs nginx + wildcard cert; external = another proxy fronts core (matches cloudapi.EdgeComponent)
export class EdgeComponentDto {
  @ApiProperty({ enum: ComponentModeValues, example: 'managed' })
  mode: ComponentMode;

  @ApiPropertyOptional({
    example: 'ops@vrittiai.com',
    description: "Let's Encrypt registration email (required when managed)",
  })
  acmeEmail?: string;
}

// The Gitea component — a post-setup opt-in add-on (matches cloudapi.GiteaComponent)
export class GiteaComponentDto {
  @ApiProperty({ example: false })
  enabled: boolean;
}

// The resolved stack composition the agent reconciles toward; absent components are null (matches cloudapi.Components)
export class ComponentsDto {
  @ApiProperty({ type: CoreComponentDto })
  core: CoreComponentDto;

  @ApiProperty({ type: DatabaseComponentDto, nullable: true })
  database: DatabaseComponentDto | null;

  @ApiProperty({ type: EdgeComponentDto, nullable: true })
  edge: EdgeComponentDto | null;

  @ApiProperty({ type: GiteaComponentDto, nullable: true })
  gitea: GiteaComponentDto | null;

  @ApiProperty({
    type: SecretProviderDto,
    nullable: true,
    description: 'Secret-store config; the auth secret half arrives via sealedSecrets under secretStore.* names',
  })
  secretStore: SecretProviderDto | null;
}

// Desired running state the agent reconciles toward (matches cloudapi.DesiredState — exact JSON field names)
export class DesiredStateDto {
  @ApiProperty({ description: 'Monotonic generation; the agent skips reconcile when unchanged', example: 3 })
  generation: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ description: 'Spec schema version', example: 1 })
  specVersion: number;

  @ApiProperty({ example: 'apw1.vrittiai.com' })
  baseDomain: string;

  @ApiProperty({ type: ComponentsDto, description: 'The resolved stack composition to reconcile toward' })
  components: ComponentsDto;

  @ApiProperty({ example: true, description: "Use the Let's Encrypt staging CA" })
  acmeStaging: boolean;

  @ApiProperty({ type: ImagesDto })
  images: ImagesDto;

  @ApiProperty({ type: [WebBundleDto], description: 'Static web artifacts the managed edge serves off *.<base>' })
  webBundles: WebBundleDto[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Plaintext non-secret config' })
  config: Record<string, string>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'name → base64 sealed ciphertext (agent decrypts)',
  })
  sealedSecrets: Record<string, string>;

  @ApiProperty({
    example: false,
    description: 'Operator took the deployment offline: the agent tears the stack down and suspends self-heal',
  })
  stopped: boolean;
}
