import { Injectable, Logger } from '@nestjs/common';
import type { DeploymentEvent } from '@/db/schema';
import {
  DEPLOYMENT_EVENTS_PAGE_SIZE,
  type DeploymentEventCursor,
  DeploymentEventDomainRepository,
} from '../repositories/deployment-event.repository';

// One event to append to a deployment's timeline
export interface AppendEventInput {
  generation?: number | null;
  level: 'info' | 'warn' | 'error';
  component?: string | null;
  reason: string;
  message: string;
}

// A page of timeline events plus the cursor to fetch the next (older) page — null when exhausted
export interface DeploymentEventPage {
  events: DeploymentEvent[];
  nextCursor: string | null;
}

@Injectable()
export class DeploymentEventDomainService {
  private readonly logger = new Logger(DeploymentEventDomainService.name);

  constructor(private readonly eventRepository: DeploymentEventDomainRepository) {}

  // Appends one event to the deployment's append-only timeline
  async append(deploymentId: string, input: AppendEventInput): Promise<DeploymentEvent> {
    const event = await this.eventRepository.append({
      deploymentId,
      generation: input.generation ?? null,
      level: input.level,
      component: input.component ?? null,
      reason: input.reason,
      message: input.message,
    });
    this.logger.log(`Appended ${input.level} event "${input.reason}" for deployment ${deploymentId}`);
    return event;
  }

  // Returns a newest-first page of the deployment's timeline, keyset-paginated by an opaque cursor
  async listByDeployment(deploymentId: string, cursor?: string): Promise<DeploymentEventPage> {
    const decoded = this.decodeCursor(cursor);
    // Fetch one extra row to determine whether a further (older) page exists
    const rows = await this.eventRepository.listByDeployment(deploymentId, decoded, DEPLOYMENT_EVENTS_PAGE_SIZE + 1);
    const hasMore = rows.length > DEPLOYMENT_EVENTS_PAGE_SIZE;
    const events = hasMore ? rows.slice(0, DEPLOYMENT_EVENTS_PAGE_SIZE) : rows;
    const last = events.at(-1);
    const nextCursor = hasMore && last ? this.encodeCursor({ createdAt: last.createdAt, id: last.id }) : null;
    this.logger.log(`Listed ${events.length} timeline event(s) for deployment ${deploymentId}`);
    return { events, nextCursor };
  }

  // Encodes a keyset cursor as a URL-safe base64 "<createdAtISO>|<id>" token
  private encodeCursor(cursor: DeploymentEventCursor): string {
    return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`, 'utf8').toString('base64url');
  }

  // Decodes an opaque cursor back into its keyset parts; treats malformed cursors as absent
  private decodeCursor(cursor?: string): DeploymentEventCursor | undefined {
    if (!cursor) return undefined;
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const separator = decoded.lastIndexOf('|');
    if (separator === -1) return undefined;
    const createdAt = new Date(decoded.slice(0, separator));
    const id = decoded.slice(separator + 1);
    if (Number.isNaN(createdAt.getTime()) || !id) return undefined;
    return { createdAt, id };
  }
}
