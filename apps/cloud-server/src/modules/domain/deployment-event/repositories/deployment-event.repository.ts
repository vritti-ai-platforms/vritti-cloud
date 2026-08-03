import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, desc, eq, lt, or } from '@vritti/api-sdk/drizzle-orm';
import type { DeploymentEvent, NewDeploymentEvent } from '@/db/schema';
import { deploymentEvents } from '@/db/schema';

// How many events one timeline page returns
export const DEPLOYMENT_EVENTS_PAGE_SIZE = 50;

// A decoded keyset cursor — the (createdAt, id) of the last row on the previous page
export interface DeploymentEventCursor {
  createdAt: Date;
  id: string;
}

@Injectable()
export class DeploymentEventDomainRepository extends PrimaryBaseRepository<typeof deploymentEvents> {
  constructor(database: PrimaryDatabaseService) {
    super(database, deploymentEvents);
  }

  // Appends one event to the deployment's timeline
  async append(event: NewDeploymentEvent): Promise<DeploymentEvent> {
    return this.create(event);
  }

  // Keyset-paginated newest-first read for a deployment; fetches one extra row to detect a further page
  async listByDeployment(
    deploymentId: string,
    cursor: DeploymentEventCursor | undefined,
    limit: number,
  ): Promise<DeploymentEvent[]> {
    const keyset = cursor
      ? or(
          lt(deploymentEvents.createdAt, cursor.createdAt),
          and(eq(deploymentEvents.createdAt, cursor.createdAt), lt(deploymentEvents.id, cursor.id)),
        )
      : undefined;
    return this.db
      .select()
      .from(deploymentEvents)
      .where(and(eq(deploymentEvents.deploymentId, deploymentId), keyset))
      .orderBy(desc(deploymentEvents.createdAt), desc(deploymentEvents.id))
      .limit(limit);
  }
}
