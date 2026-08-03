import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, desc, eq, gt, ne, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Deployment, DeploymentAgent, NewDeploymentAgent } from '@/db/schema';
import { deploymentAgents, deployments } from '@/db/schema';

@Injectable()
export class DeploymentAgentDomainRepository extends PrimaryBaseRepository<typeof deploymentAgents> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentAgents);
  }

  // Returns the current (latest non-revoked) agent row for a deployment — revoked history rows are ignored
  async findByDeploymentId(deploymentId: string): Promise<DeploymentAgent | undefined> {
    const rows = await this.db
      .select()
      .from(deploymentAgents)
      .where(and(eq(deploymentAgents.deploymentId, deploymentId), ne(deploymentAgents.status, 'revoked')))
      .orderBy(desc(deploymentAgents.createdAt))
      .limit(1);
    return rows[0];
  }

  // Returns the enrolled agent for a deployment, if any
  async findEnrolledByDeploymentId(deploymentId: string): Promise<DeploymentAgent | undefined> {
    return this.model.findFirst({ where: { deploymentId, status: 'enrolled' } });
  }

  // Finds a pending agent row matching an unexpired enroll-token hash
  async findPendingByTokenHash(deploymentId: string, tokenHash: string): Promise<DeploymentAgent | undefined> {
    const rows = await this.db
      .select()
      .from(deploymentAgents)
      .where(
        and(
          eq(deploymentAgents.deploymentId, deploymentId),
          eq(deploymentAgents.status, 'pending'),
          eq(deploymentAgents.enrollTokenHash, tokenHash),
          gt(deploymentAgents.enrollTokenExpiresAt, new Date()),
        ),
      )
      .limit(1);
    return rows[0];
  }

  // Revokes any existing agent(s) for a deployment (preserving history + heartbeat/gitea state) and inserts a fresh pending enroll-token row
  async replaceWithPending(deploymentId: string, tokenHash: string, expiresAt: Date): Promise<DeploymentAgent> {
    await this.db
      .update(deploymentAgents)
      .set({ status: 'revoked', enrollTokenHash: null, enrollTokenExpiresAt: null })
      .where(and(eq(deploymentAgents.deploymentId, deploymentId), ne(deploymentAgents.status, 'revoked')));
    return this.create({
      deploymentId,
      enrollTokenHash: tokenHash,
      enrollTokenExpiresAt: expiresAt,
    } as NewDeploymentAgent);
  }

  // Marks an agent enrolled, storing its public keys, version, and credential hash, and burning the enroll token
  async markEnrolled(
    id: string,
    data: {
      agentSigningPubKey: string;
      agentSealingPubKey: string | null;
      agentVersion: string | null;
      agentCredentialHash: string;
    },
  ): Promise<DeploymentAgent> {
    return this.update(id, {
      status: 'enrolled',
      agentSigningPubKey: data.agentSigningPubKey,
      agentSealingPubKey: data.agentSealingPubKey,
      agentVersion: data.agentVersion,
      agentCredentialHash: data.agentCredentialHash,
      enrollTokenHash: null,
      enrollTokenExpiresAt: null,
    });
  }

  // Records a heartbeat from the agent
  async recordHeartbeat(
    id: string,
    data: {
      generation: number;
      phase: string;
      message: string | null;
      giteaProvisioned: boolean;
      acmeDelegation: { name: string; target: string; zone: string; serverIp: string } | null;
    },
  ): Promise<void> {
    await this.db
      .update(deploymentAgents)
      .set({
        lastHeartbeatAt: new Date(),
        lastGeneration: data.generation,
        lastPhase: data.phase,
        lastMessage: data.message,
        giteaProvisioned: data.giteaProvisioned,
        acmeDelegation: data.acmeDelegation,
      })
      .where(eq(deploymentAgents.id, id));
  }

  // Cross-table read: returns the deployment row (needed for keys, version, base domain, generation)
  async findDeploymentById(deploymentId: string): Promise<Deployment | undefined> {
    const rows = await this.db.select().from(deployments).where(eq(deployments.id, deploymentId)).limit(1);
    return rows[0];
  }

  // Cross-table write: persists the lazily generated Keypair B on the deployment row
  async setAgentSigningKey(deploymentId: string, privateKey: string, publicKey: string): Promise<void> {
    await this.db
      .update(deployments)
      .set({ agentSigningKey: privateKey, agentSigningPublicKey: publicKey })
      .where(eq(deployments.id, deploymentId));
  }

  // Cross-table write: bumps the desired-state generation and stores the new payload hash
  async setDesiredState(deploymentId: string, generation: number, hash: string): Promise<void> {
    await this.db
      .update(deployments)
      .set({ desiredGeneration: generation, lastDesiredHash: hash })
      .where(eq(deployments.id, deploymentId));
  }

  // Returns the number of organizations bound to a deployment (informational, unused by MVP flow)
  async countAgents(deploymentId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(deploymentAgents)
      .where(eq(deploymentAgents.deploymentId, deploymentId));
    return Number(result[0]?.count ?? 0);
  }
}
