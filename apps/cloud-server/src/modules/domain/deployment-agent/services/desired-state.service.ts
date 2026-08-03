import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Deployment } from '@/db/schema';
import { DeploymentManagementModeValues } from '@/db/schema';
import {
  DEFAULT_STACK_IMAGES,
  DEFAULT_WEB_BUNDLES,
  IMAGE_ENV_KEYS,
  WEB_BUNDLES_ENV_KEY,
} from '../deployment-agent.constants';
import {
  DesiredStateDto,
  DesiredStateEdgeValues,
  DesiredStateModeValues,
  type ImagesDto,
  type SecretProviderDto,
  type WebBundleDto,
} from '../dto/entity/desired-state.dto';

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
    // managed = agent runs its own Postgres container; external = agent connects to an existing DB (creds from the secret store)
    dto.mode = deployment.mode === 'external' ? DesiredStateModeValues.external : DesiredStateModeValues.managed;
    dto.baseDomain = this.resolveBaseDomain(deployment.url);
    // managed = agent runs its own nginx edge + wildcard cert (routing derived from baseDomain); external = another proxy fronts core
    dto.edge = deployment.edge === 'external' ? DesiredStateEdgeValues.external : DesiredStateEdgeValues.managed;
    dto.images = this.resolveImages();
    // Static web artifacts (core-web host + MF remotes) the managed edge serves off *.<base>
    dto.webBundles = this.resolveWebBundles();
    // Per-deployment add-on toggles; their runtime secrets (R2 creds, gitea admin) ride the secret store
    dto.addOns = { pgBackRest: deployment.addonPgbackrest, gitea: deployment.addonGitea };
    dto.acmeEmail = this.resolveAcmeEmail(deployment);
    // Default OFF — a managed prod edge must opt IN to the untrusted Let's Encrypt staging CA
    dto.acmeStaging = this.configService.get<boolean>('ACME_STAGING') ?? false;
    dto.config = this.buildConfig(deployment);
    // Non-secret secret-store config; the sealed auth secret half is carried alongside in sealedSecrets
    dto.secretProvider = this.resolveSecretProvider(deployment);
    dto.sealedSecrets = sealedSecrets;
    this.logger.log(`Built desired-state for deployment ${deployment.id} (base ${dto.baseDomain})`);
    return dto;
  }

  // Resolves the per-deployment ACME email (warns but does not fail when a managed edge lacks one —
  // the agent cannot register the wildcard cert with Let's Encrypt without it)
  private resolveAcmeEmail(deployment: Deployment): string {
    const email = deployment.acmeEmail ?? '';
    if (!email && deployment.edge !== 'external') {
      this.logger.warn(
        `Deployment ${deployment.id} has a managed edge but no acmeEmail — the agent cannot register the wildcard cert with Let's Encrypt`,
      );
    }
    return email;
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

  // Resolves the secret-store config (warns when an agent-managed deployment has none — the agent cannot source core/commerce env)
  private resolveSecretProvider(deployment: Deployment): SecretProviderDto | null {
    if (!deployment.secretProvider) {
      if (deployment.managementMode === DeploymentManagementModeValues.agent) {
        this.logger.warn(
          `Deployment ${deployment.id} is agent-managed but has no secretProvider — the agent cannot source core-server/commerce runtime env`,
        );
      }
      return null;
    }
    return deployment.secretProvider;
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
