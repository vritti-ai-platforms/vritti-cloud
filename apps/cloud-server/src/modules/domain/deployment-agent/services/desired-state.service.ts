import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Deployment } from '@/db/schema';
import {
  DesiredStateDto,
  DesiredStateModeValues,
  type ImagesDto,
} from '@/modules/agent-api/dto/entity/desired-state.dto';
import { DEFAULT_STACK_IMAGES, IMAGE_ENV_KEYS } from '../deployment-agent.constants';

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
    // MVP: apw1 runs a managed containerized Postgres; external mode arrives with a sealed connection secret later
    dto.mode = DesiredStateModeValues.managed;
    dto.baseDomain = this.resolveBaseDomain(deployment.url);
    dto.images = this.resolveImages();
    // MVP is core-only — add-ons stay off until per-deployment add-on flags exist
    dto.addOns = { pgBackRest: false, gitea: false, nginx: false };
    dto.config = this.buildConfig(deployment);
    dto.sealedSecrets = sealedSecrets;
    this.logger.log(`Built desired-state for deployment ${deployment.id} (base ${dto.baseDomain})`);
    return dto;
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
