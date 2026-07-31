import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { hashToken } from '@vritti/api-sdk/auth';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@vritti/api-sdk/exceptions';
import { canonicalStringify, generateSigningKeyPair } from '@vritti/api-sdk/signing';
import type { Deployment, DeploymentAgent } from '@/db/schema';
import { DeploymentManagementModeValues } from '@/db/schema';
import { AgentStatusDto } from '@/modules/admin-api/deployment/agent/dto/entity/agent-status.dto';
import { EnrollTokenDto } from '@/modules/admin-api/deployment/agent/dto/response/enroll-token.dto';
import type { EnrollRequestDto } from '@/modules/agent-api/dto/request/enroll-request.dto';
import type { StatusReportDto } from '@/modules/agent-api/dto/request/status-report.dto';
import type { EnrollResponseDto } from '@/modules/agent-api/dto/response/enroll-response.dto';
import type { SignedDesiredStateDto } from '@/modules/agent-api/dto/response/signed-desired-state.dto';
import {
  generateOpaqueToken,
  signEd25519B64,
  spkiToRawEd25519PubB64,
  verifyEd25519RawPubB64,
} from '../agent-crypto.util';
import { ENROLL_TOKEN_TTL_MS } from '../deployment-agent.constants';
import { DeploymentAgentDomainRepository } from '../repositories/deployment-agent.repository';
import { DeploymentSecretDomainRepository } from '../repositories/deployment-secret.repository';
import { DesiredStateDomainService } from './desired-state.service';

// Context extracted from the signed agent request (raw body + Ed25519 signature headers)
export interface AgentRequestContext {
  deploymentId: string | undefined;
  agentKeyB64: string | undefined;
  signatureB64: string | undefined;
  rawBody: string;
  bearer: string | undefined;
}

@Injectable()
export class DeploymentAgentDomainService {
  private readonly logger = new Logger(DeploymentAgentDomainService.name);

  constructor(
    private readonly agentRepository: DeploymentAgentDomainRepository,
    private readonly secretRepository: DeploymentSecretDomainRepository,
    private readonly desiredStateService: DesiredStateDomainService,
  ) {}

  // Issues a one-time enroll token for a managed deployment, ensuring Keypair B exists first (admin)
  async issueEnrollToken(deploymentId: string): Promise<CreateResponseDto<EnrollTokenDto>> {
    const deployment = await this.requireDeployment(deploymentId);
    if (deployment.managementMode !== DeploymentManagementModeValues.agent) {
      throw new BadRequestException({
        label: 'Not an Agent Deployment',
        detail: 'Enroll tokens can only be issued for agent-managed deployments.',
      });
    }
    const { rawPublicKeyB64 } = await this.ensureAgentKeypair(deployment);
    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + ENROLL_TOKEN_TTL_MS);
    await this.agentRepository.replaceWithPending(deploymentId, hashToken(token), expiresAt);
    this.logger.log(`Issued enroll token for deployment ${deploymentId}`);
    return {
      success: true,
      message: 'Enroll token issued. Copy it now — it is shown only once.',
      data: { token, expiresAt, deploymentPubKey: rawPublicKeyB64 },
    };
  }

  // Returns agent status for the admin console / connect polling
  async getAgentStatus(deploymentId: string): Promise<AgentStatusDto> {
    const deployment = await this.requireDeployment(deploymentId);
    const agent = await this.agentRepository.findByDeploymentId(deploymentId);
    const deploymentPubKey = deployment.agentSigningPublicKey
      ? spkiToRawEd25519PubB64(deployment.agentSigningPublicKey)
      : null;
    this.logger.log(`Fetched agent status for deployment ${deploymentId}`);
    return AgentStatusDto.from(deploymentId, agent, deployment.desiredGeneration, deploymentPubKey);
  }

  // Completes the one-time enrollment handshake: trust-on-first-use signature + enroll token
  async enroll(dto: EnrollRequestDto, ctx: AgentRequestContext): Promise<EnrollResponseDto> {
    // Trust-on-first-use: the request body must be signed by the signing key presented in the body
    if (ctx.agentKeyB64 !== dto.signingPubKey || !ctx.signatureB64) {
      throw new UnauthorizedException('Enrollment signature key mismatch.');
    }
    if (!verifyEd25519RawPubB64(dto.signingPubKey, ctx.rawBody, ctx.signatureB64)) {
      throw new UnauthorizedException('Enrollment request signature did not verify.');
    }

    const deployment = await this.requireDeployment(dto.deploymentId);
    const pending = await this.agentRepository.findPendingByTokenHash(dto.deploymentId, hashToken(dto.enrollToken));
    if (!pending) {
      throw new UnauthorizedException('Invalid or expired enroll token.');
    }

    const { privateKey, rawPublicKeyB64 } = await this.ensureAgentKeypair(deployment);
    const agentCredential = generateOpaqueToken();
    await this.agentRepository.markEnrolled(pending.id, {
      agentSigningPubKey: dto.signingPubKey,
      agentSealingPubKey: dto.sealingPubKey ?? null,
      agentVersion: dto.agentVersion ?? null,
      agentCredentialHash: hashToken(agentCredential),
    });

    const nonce = generateOpaqueToken();
    const nonceSignature = signEd25519B64(privateKey, nonce);
    this.logger.log(`Enrolled agent for deployment ${dto.deploymentId} (version ${dto.agentVersion ?? 'unknown'})`);
    return { agentCredential, deploymentPubKey: rawPublicKeyB64, nonce, nonceSignature };
  }

  // Authenticates a signed agent request (bearer + raw-body signature vs the enrolled key); returns the agent or throws
  async verifyAgentRequest(ctx: AgentRequestContext): Promise<DeploymentAgent> {
    if (!ctx.deploymentId || !ctx.agentKeyB64 || !ctx.signatureB64 || !ctx.bearer) {
      throw new UnauthorizedException('Missing agent authentication headers.');
    }
    const agent = await this.agentRepository.findEnrolledByDeploymentId(ctx.deploymentId);
    if (!agent || !agent.agentSigningPubKey || !agent.agentCredentialHash) {
      throw new UnauthorizedException('No enrolled agent for this deployment.');
    }
    if (agent.agentSigningPubKey !== ctx.agentKeyB64) {
      throw new UnauthorizedException('Agent key does not match the enrolled key.');
    }
    if (!this.credentialMatches(ctx.bearer, agent.agentCredentialHash)) {
      throw new UnauthorizedException('Invalid agent credential.');
    }
    if (!verifyEd25519RawPubB64(ctx.agentKeyB64, ctx.rawBody, ctx.signatureB64)) {
      throw new UnauthorizedException('Agent request signature did not verify.');
    }
    return agent;
  }

  // Builds, generation-stamps, and signs the desired-state for an enrolled deployment
  async getSignedDesiredState(deploymentId: string): Promise<SignedDesiredStateDto> {
    const deployment = await this.requireDeployment(deploymentId);
    if (!deployment.agentSigningKey) {
      throw new BadRequestException('Deployment has no agent signing key. Re-issue an enroll token.');
    }
    const sealedSecrets = await this.resolveSealedSecrets(deployment);
    const payload = this.desiredStateService.build(deployment, sealedSecrets);

    // Hash the content (generation still 0) so the generation only bumps when the real payload changes
    const hash = createHash('sha256').update(canonicalStringify(payload), 'utf8').digest('hex');
    let generation = deployment.desiredGeneration;
    if (hash !== deployment.lastDesiredHash) {
      generation = deployment.desiredGeneration + 1;
      await this.agentRepository.setDesiredState(deploymentId, generation, hash);
      this.logger.log(`Bumped desired-state generation for deployment ${deploymentId} → ${generation}`);
    }
    payload.generation = generation;

    const payloadB64 = canonicalStringify(payload);
    const signature = signEd25519B64(deployment.agentSigningKey, payloadB64);
    return { payload, payloadB64, signature };
  }

  // Records an agent heartbeat (phase, generation, gitea provisioning)
  async recordStatus(agent: DeploymentAgent, dto: StatusReportDto): Promise<void> {
    await this.agentRepository.recordHeartbeat(agent.id, {
      generation: dto.generation,
      phase: dto.phase,
      message: dto.message ?? null,
      giteaProvisioned: dto.giteaProvisioned ?? false,
    });
    this.logger.log(`Recorded status for deployment ${dto.deploymentId} (phase ${dto.phase}, gen ${dto.generation})`);
  }

  // Ensures Keypair B exists on the deployment, generating and persisting it lazily; returns the private + raw public key
  private async ensureAgentKeypair(deployment: Deployment): Promise<{ privateKey: string; rawPublicKeyB64: string }> {
    if (deployment.agentSigningKey && deployment.agentSigningPublicKey) {
      return {
        privateKey: deployment.agentSigningKey,
        rawPublicKeyB64: spkiToRawEd25519PubB64(deployment.agentSigningPublicKey),
      };
    }
    const { privateKey, publicKey } = generateSigningKeyPair();
    await this.agentRepository.setAgentSigningKey(deployment.id, privateKey, publicKey);
    deployment.agentSigningKey = privateKey;
    deployment.agentSigningPublicKey = publicKey;
    this.logger.log(`Generated agent signing keypair (Keypair B) for deployment ${deployment.id}`);
    return { privateKey, rawPublicKeyB64: spkiToRawEd25519PubB64(publicKey) };
  }

  // Resolves operator secrets to sealed ciphertext for the agent — MVP returns empty (reseal not yet implemented)
  private async resolveSealedSecrets(deployment: Deployment): Promise<Record<string, string>> {
    const secrets = await this.secretRepository.findByDeploymentId(deployment.id);
    if (secrets.length === 0) return {};
    // TODO(agent-secrets): decrypt-at-rest then reseal each to the agent's X25519 sealing pubkey via crypto_box_seal.
    // Blocked until a libsodium-compatible dep is added (see agent-crypto.util.sealToAgentX25519).
    this.logger.warn(
      `Deployment ${deployment.id} has ${secrets.length} operator secret(s) but sealing is not implemented — omitting from desired-state`,
    );
    return {};
  }

  // Constant-time comparison of a bearer credential against its stored sha256 hash
  private credentialMatches(bearer: string, storedHash: string): boolean {
    const provided = Buffer.from(hashToken(bearer), 'utf8');
    const stored = Buffer.from(storedHash, 'utf8');
    return provided.length === stored.length && timingSafeEqual(provided, stored);
  }

  // Loads a deployment or throws NotFound
  private async requireDeployment(deploymentId: string): Promise<Deployment> {
    const deployment = await this.agentRepository.findDeploymentById(deploymentId);
    if (!deployment) {
      throw new NotFoundException('Deployment not found.');
    }
    return deployment;
  }
}
