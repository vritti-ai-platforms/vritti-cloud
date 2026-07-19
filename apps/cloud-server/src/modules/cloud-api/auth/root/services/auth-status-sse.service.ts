import { Injectable, Logger, type MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { concat, merge, NEVER, type Observable, of, Subject } from 'rxjs';
import { AuthService } from './auth.service';

interface UserConnection {
  subject: Subject<MessageEvent>;
  sessionId: string;
  createdAt: Date;
}

@Injectable()
export class AuthStatusSseService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthStatusSseService.name);
  private readonly connections = new Map<string, UserConnection[]>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private readonly authService: AuthService) {
    this.cleanupInterval = setInterval(() => this.cleanupClosedConnections(), 60000);
  }

  // Completes all active SSE subjects and clears the connection map on shutdown
  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    for (const [, conns] of this.connections) {
      for (const conn of conns) {
        conn.subject.complete();
      }
    }
    this.connections.clear();
  }

  async streamAuthStatus(refreshToken: string | undefined): Promise<Observable<MessageEvent>> {
    const authResponse = await this.authService.getAuthStatus(refreshToken);

    // Not authenticated — send auth state and keep connection open (prevents reconnect loop)
    if (!authResponse.isAuthenticated || !authResponse.user) {
      const initial$ = of({ type: 'auth-state', data: JSON.stringify(authResponse) } as MessageEvent);
      return concat(initial$, NEVER);
    }

    // Register SSE connection for real-time updates, keyed by sessionId
    const connection$ = this.addConnection(authResponse.user.id, authResponse.sessionId as string);

    // Push initial auth state, then stream updates
    const initial$ = of({ type: 'auth-state', data: JSON.stringify(authResponse) } as MessageEvent);
    return merge(initial$, connection$.asObservable());
  }

  // Adds a new SSE connection for the user, tagged with sessionId
  addConnection(userId: string, sessionId: string): Subject<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    const existing = this.connections.get(userId) || [];
    existing.push({ subject, sessionId, createdAt: new Date() });
    this.connections.set(userId, existing);

    this.logger.log(`Added SSE connection for user ${userId}, session ${sessionId} (total: ${existing.length})`);
    return subject;
  }

  // Sends an event to all active connections for the given user
  sendToUser(userId: string, event: MessageEvent): boolean {
    const conns = this.connections.get(userId);

    if (!conns || conns.length === 0) {
      this.logger.debug(`No active SSE connections for user ${userId}`);
      return false;
    }

    let sentCount = 0;
    for (const conn of conns) {
      if (!conn.subject.closed) {
        conn.subject.next(event);
        sentCount++;
      }
    }

    this.logger.log(`Sent auth-status event to ${sentCount} connection(s) for user ${userId}`);
    return sentCount > 0;
  }

  // Sends an event only to connections matching a specific sessionId
  sendToSession(userId: string, sessionId: string, event: MessageEvent): boolean {
    const conns = this.connections.get(userId);

    if (!conns || conns.length === 0) {
      this.logger.debug(`No active SSE connections for user ${userId}`);
      return false;
    }

    let sentCount = 0;
    for (const conn of conns) {
      if (conn.sessionId === sessionId && !conn.subject.closed) {
        conn.subject.next(event);
        sentCount++;
      }
    }

    this.logger.log(
      `Sent auth-status event to ${sentCount} session connection(s) for user ${userId}, session ${sessionId}`,
    );
    return sentCount > 0;
  }

  // Removes a specific connection by subject reference and cleans up if empty
  removeConnection(userId: string, subject: Subject<MessageEvent>): void {
    const conns = this.connections.get(userId);

    if (!conns) return;

    const filtered = conns.filter((c) => c.subject !== subject);

    if (filtered.length === 0) {
      this.connections.delete(userId);
    } else {
      this.connections.set(userId, filtered);
    }

    subject.complete();
    this.logger.log(`Removed SSE connection for user ${userId} (remaining: ${filtered.length})`);
  }

  // Returns the total number of users with active connections
  getConnectionCount(): number {
    return this.connections.size;
  }

  // Removes closed subjects from the connection map
  private cleanupClosedConnections(): void {
    let cleanedCount = 0;

    for (const [userId, conns] of this.connections) {
      const active = conns.filter((c) => !c.subject.closed);

      if (active.length === 0) {
        this.connections.delete(userId);
        cleanedCount += conns.length;
      } else if (active.length < conns.length) {
        cleanedCount += conns.length - active.length;
        this.connections.set(userId, active);
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} closed SSE connections`);
    }
  }
}
