import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashToken } from '@vritti/api-sdk/auth';
import { CreateResponseDto } from '@vritti/api-sdk/database';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@vritti/api-sdk/exceptions';
import { canonicalStringify, generateSigningKeyPair } from '@vritti/api-sdk/signing';
import type { Deployment, DeploymentAgent, DeploymentCertificate, DeploymentSecret } from '@/db/schema';
import { DeploymentManagementModeValues } from '@/db/schema';
import { CryptoService } from '@/services';
import {
  generateOpaqueToken,
  sealToAgent,
  signEd25519B64,
  spkiToRawEd25519PubB64,
  verifyEd25519RawPubB64,
} from '../agent-crypto.util';
import { ENROLL_TOKEN_TTL_MS } from '../deployment-agent.constants';
import type { EnrollRequestDto } from '../dto/request/enroll-request.dto';
import type { CertificateReportDto, StatusReportDto } from '../dto/request/status-report.dto';
import { DeploymentAgentDomainRepository } from '../repositories/deployment-agent.repository';
import { DeploymentCertificateDomainRepository } from '../repositories/deployment-certificate.repository';
import { DeploymentSecretDomainRepository } from '../repositories/deployment-secret.repository';
import { DesiredStateDomainService } from './desired-state.service';

// Context extracted from the signed agent request (signed message bytes + Ed25519 signature headers)
export interface AgentRequestContext {
  deploymentId: string | undefined;
  agentKeyB64: string | undefined;
  signatureB64: string | undefined;
  rawBody: string;
  bearer: string | undefined;
}

// One-time enroll token payload (the controller shapes this into the admin EnrollTokenDto)
export interface EnrollTokenData {
  token: string;
  expiresAt: Date;
  deploymentPubKey: string;
  cloudApiUrl: string;
}

// Successful-enrollment result (the controller shapes this into the agent-api EnrollResponseDto)
export interface EnrollResult {
  agentCredential: string;
  deploymentPubKey: string;
  nonce: string;
  nonceSignature: string;
}

// Raw agent-status pieces (the controller shapes these into the admin AgentStatusDto)
export interface AgentStatusData {
  deploymentId: string;
  agent: DeploymentAgent | undefined;
  desiredGeneration: number;
  deploymentPubKey: string | null;
  certificates: DeploymentCertificate[];
}

// Signed desired-state bytes + signature (the controller shapes these into the agent-api SignedDesiredStateDto)
export interface SignedDesiredState {
  payloadB64: string;
  signature: string;
}

@Injectable()
export class DeploymentAgentDomainService {
  private readonly logger = new Logger(DeploymentAgentDomainService.name);

  constructor(
    private readonly agentRepository: DeploymentAgentDomainRepository,
    private readonly secretRepository: DeploymentSecretDomainRepository,
    private readonly certificateRepository: DeploymentCertificateDomainRepository,
    private readonly desiredStateService: DesiredStateDomainService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  // Issues a one-time enroll token for a managed deployment, ensuring Keypair B exists first (admin)
  async issueEnrollToken(deploymentId: string): Promise<CreateResponseDto<EnrollTokenData>> {
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
    // The agent API is served on the api. subdomain of the cloud's base domain (VRITTI_CLOUD_API_URL).
    const cloudApiUrl = `https://api.${this.configService.getOrThrow<string>('BASE_DOMAIN')}`;
    return {
      success: true,
      message: 'Enroll token issued. Copy it now — it is shown only once.',
      data: { token, expiresAt, deploymentPubKey: rawPublicKeyB64, cloudApiUrl },
    };
  }

  // Returns raw agent-status pieces for the admin console / connect polling (shaped by the controller)
  async getAgentStatus(deploymentId: string): Promise<AgentStatusData> {
    const deployment = await this.requireDeployment(deploymentId);
    const agent = await this.agentRepository.findByDeploymentId(deploymentId);
    const certificates = await this.certificateRepository.findByDeploymentId(deploymentId);
    const deploymentPubKey = deployment.agentSigningPublicKey
      ? spkiToRawEd25519PubB64(deployment.agentSigningPublicKey)
      : null;
    this.logger.log(`Fetched agent status for deployment ${deploymentId}`);
    return { deploymentId, agent, desiredGeneration: deployment.desiredGeneration, deploymentPubKey, certificates };
  }

  // Completes the one-time enrollment handshake: trust-on-first-use signature + enroll token
  async enroll(dto: EnrollRequestDto, ctx: AgentRequestContext): Promise<EnrollResult> {
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
  async getSignedDesiredState(deploymentId: string): Promise<SignedDesiredState> {
    const deployment = await this.requireDeployment(deploymentId);
    if (!deployment.agentSigningKey) {
      throw new BadRequestException('Deployment has no agent signing key. Re-issue an enroll token.');
    }

    // Load operator secrets + the enrolled agent once — used for both the staleness fingerprint and the sealing
    const secrets = await this.secretRepository.findByDeploymentId(deployment.id);
    const agent = await this.agentRepository.findEnrolledByDeploymentId(deployment.id);

    // Build the desired-state WITHOUT sealed ciphertext, then hash a DETERMINISTIC representation.
    // crypto_box_seal uses a fresh ephemeral keypair per call, so the sealed bytes differ on every build;
    // hashing the pre-seal payload + a secret fingerprint (name + updatedAt) keeps the generation stable across polls.
    const payload = this.desiredStateService.build(deployment, {});
    const hash = createHash('sha256')
      .update(canonicalStringify({ payload, secrets: this.secretFingerprint(secrets) }), 'utf8')
      .digest('hex');

    let generation = deployment.desiredGeneration;
    if (hash !== deployment.lastDesiredHash) {
      generation = deployment.desiredGeneration + 1;
      await this.agentRepository.setDesiredState(deploymentId, generation, hash);
      this.logger.log(`Bumped desired-state generation for deployment ${deploymentId} → ${generation}`);
    }

    // Seal secrets and finalize the payload only after the generation decision (sealing never affects the hash)
    payload.sealedSecrets = await this.sealSecrets(deployment, secrets, agent);
    payload.generation = generation;

    const payloadB64 = canonicalStringify(payload);
    const signature = signEd25519B64(deployment.agentSigningKey, payloadB64);
    return { payloadB64, signature };
  }

  // Records an agent heartbeat (phase, generation, gitea provisioning) and tracks reported certificates
  async recordStatus(agent: DeploymentAgent, dto: StatusReportDto): Promise<void> {
    // The guard-resolved agent is authoritative — reject a body whose deploymentId disagrees
    if (dto.deploymentId !== agent.deploymentId) {
      throw new BadRequestException('Status report deploymentId does not match the authenticated agent.');
    }
    await this.agentRepository.recordHeartbeat(agent.id, {
      generation: dto.generation,
      phase: dto.phase,
      message: dto.message ?? null,
      giteaProvisioned: dto.giteaProvisioned ?? false,
    });
    await this.recordCertificates(agent.deploymentId, dto.certificates);
    this.logger.log(`Recorded status for deployment ${agent.deploymentId} (phase ${dto.phase}, gen ${dto.generation})`);
  }

  // Upserts each reported certificate by (deployment, host) — cloud-server is the system of record for expiry
  private async recordCertificates(deploymentId: string, certificates?: CertificateReportDto[]): Promise<void> {
    if (!certificates?.length) return;
    for (const cert of certificates) {
      await this.certificateRepository.upsertByHost(deploymentId, {
        host: cert.host,
        notAfter: new Date(cert.notAfter),
        issuedAt: new Date(cert.issuedAt),
      });
    }
    this.logger.log(`Tracked ${certificates.length} certificate(s) for deployment ${deploymentId}`);
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

  // Deterministic per-secret fingerprint (name → updatedAt/createdAt ISO) — excludes the ciphertext so re-sealing never churns the hash
  private secretFingerprint(secrets: DeploymentSecret[]): Record<string, string> {
    const fingerprint: Record<string, string> = {};
    for (const secret of secrets) {
      fingerprint[secret.name] = (secret.updatedAt ?? secret.createdAt).toISOString();
    }
    return fingerprint;
  }

  // Decrypts each operator secret at rest and reseals it to the enrolled agent's X25519 sealing pubkey (name → sealed b64)
  private async sealSecrets(
    deployment: Deployment,
    secrets: DeploymentSecret[],
    agent: DeploymentAgent | undefined,
  ): Promise<Record<string, string>> {
    if (secrets.length === 0) return {};
    if (!agent?.agentSealingPubKey) {
      this.logger.warn(
        `Deployment ${deployment.id} has ${secrets.length} operator secret(s) but no enrolled agent sealing key — omitting from desired-state`,
      );
      return {};
    }
    const sealed: Record<string, string> = {};
    for (const secret of secrets) {
      const plaintext = this.cryptoService.decrypt(secret.encryptedValue);
      sealed[secret.name] = await sealToAgent(plaintext, agent.agentSealingPubKey);
    }
    this.logger.log(`Sealed ${secrets.length} operator secret(s) for deployment ${deployment.id}`);
    return sealed;
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
