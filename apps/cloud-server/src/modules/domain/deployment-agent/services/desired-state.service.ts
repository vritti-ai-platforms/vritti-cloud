import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Deployment } from '@/db/schema';
import { DeploymentManagementTypeValues } from '@/db/schema';
import {
  DEFAULT_STACK_IMAGES,
  DEFAULT_WEB_BUNDLES,
  IMAGE_ENV_KEYS,
  WEB_BUNDLES_ENV_KEY,
} from '../deployment-agent.constants';
import { ComponentsDto, DesiredStateDto, type ImagesDto, type WebBundleDto } from '../dto/entity/desired-state.dto';

@Injectable()
export class DesiredStateDomainService {
  private readonly logger = new Logger(DesiredStateDomainService.name);

  constructor(private readonly configService: ConfigService) {}

  // Assembles the unsigned desired-state (generation left at 0 — set by the caller after the staleness check)
  build(deployment: Deployment, sealedSecrets: Record<string, string>): DesiredStateDto {
    const dto = new DesiredStateDto();
    dto.generation = 0;
    dto.deploymentId = deployment.id;
    dto.version = deployment.version;
    dto.specVersion = deployment.spec.specVersion;
    dto.baseDomain = this.resolveBaseDomain(deployment.url);
    // The resolved component composition (absent components are null) — the agent reconciles toward this
    dto.components = this.buildComponents(deployment);
    dto.images = this.resolveImages();
    // Static web artifacts (core-web host + MF remotes) the managed edge serves off *.<base>
    dto.webBundles = this.resolveWebBundles();
    // Default OFF — a managed prod edge must opt IN to the untrusted Let's Encrypt staging CA
    dto.acmeStaging = this.configService.get<boolean>('ACME_STAGING') ?? false;
    dto.config = this.buildConfig(deployment);
    dto.sealedSecrets = sealedSecrets;
    this.logger.log(`Built desired-state for deployment ${deployment.id} (base ${dto.baseDomain})`);
    return dto;
  }

  // Projects the stored spec.components onto the wire ComponentsDto, defaulting core.enabled and nulling absent components
  private buildComponents(deployment: Deployment): ComponentsDto {
    const spec = deployment.spec.components;
    const components = new ComponentsDto();
    // core is always present on a managed deployment (defaults enabled); the agent runs core-server/commerce/nats/redis
    components.core = { enabled: spec.core?.enabled ?? true };
    components.database = spec.database
      ? {
          mode: spec.database.mode,
          ...(spec.database.backup ? { backup: { retention: spec.database.backup.retention } } : {}),
        }
      : null;
    components.edge = spec.edge
      ? { mode: spec.edge.mode, ...(spec.edge.acmeEmail ? { acmeEmail: spec.edge.acmeEmail } : {}) }
      : null;
    components.gitea = spec.gitea ? { enabled: spec.gitea.enabled } : null;
    // Non-secret secret-store config; the sealed auth secret half is carried alongside in sealedSecrets
    components.secretStore = spec.secretStore ?? null;
    if (!components.secretStore && deployment.managementType === DeploymentManagementTypeValues.managed) {
      this.logger.warn(
        `Deployment ${deployment.id} is managed but has no secretStore component — the agent cannot source core-server/commerce runtime env`,
      );
    }
    if (components.edge?.mode === 'managed' && !components.edge.acmeEmail) {
      this.logger.warn(
        `Deployment ${deployment.id} has a managed edge but no acmeEmail — the agent cannot register the wildcard cert with Let's Encrypt`,
      );
    }
    return components;
  }

  // Resolves the static web bundles the managed edge serves (core-web host + MF remotes), allowing a
  // wholesale AGENT_WEB_BUNDLES env override (JSON array). A malformed override falls back to defaults.
  private resolveWebBundles(): WebBundleDto[] {
    const raw = this.configService.get<string>(WEB_BUNDLES_ENV_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as WebBundleDto[];
        if (
          Array.isArray(parsed) &&
          parsed.every((b) => typeof b?.artifact === 'string' && typeof b?.path === 'string')
        ) {
          return parsed;
        }
        this.logger.warn(`${WEB_BUNDLES_ENV_KEY} is not a valid WebBundle[] — using defaults`);
      } catch {
        this.logger.warn(`${WEB_BUNDLES_ENV_KEY} is not valid JSON — using defaults`);
      }
    }
    return DEFAULT_WEB_BUNDLES.map((b) => ({ ...b }));
  }

  // Plaintext non-secret config passed through to core-server env — machine secrets are NEVER placed here
  private buildConfig(deployment: Deployment): Record<string, string> {
    const config: Record<string, string> = {};
    // Keypair A public — core verifies catalog/entitlement pushes against this
    if (deployment.signingPublicKey) {
      config.LICENSE_PUBLIC_KEY = deployment.signingPublicKey;
    }
    return config;
  }

  // Resolves each pinned image, allowing an AGENT_IMAGE_* env override per key
  private resolveImages(): ImagesDto {
    const images = {} as ImagesDto;
    for (const key of Object.keys(DEFAULT_STACK_IMAGES) as (keyof typeof DEFAULT_STACK_IMAGES)[]) {
      images[key] = this.configService.get<string>(IMAGE_ENV_KEYS[key]) ?? DEFAULT_STACK_IMAGES[key];
    }
    return images;
  }

  // Derives the deployment base domain from its URL host (falls back to the raw URL)
  private resolveBaseDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}
