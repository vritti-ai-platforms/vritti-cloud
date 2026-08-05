import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AGENT_DISCONNECT_GRACE_MS, DEPLOYMENT_AGENT_CONNECTIVITY_CHANGED_EVENT } from '../deployment-agent.constants';

// In-memory registry of which deployments currently have a live agent Subscribe stream. The Connect
// service marks streams connected/disconnected; the admin API reads isConnected() for the cockpit's
// online/offline state and reacts to connectivity-changed events. Ephemeral (rebuilt from live streams on
// restart) — agent connectivity is real-time truth, not something to persist.
@Injectable()
export class AgentConnectivityService {
  // deploymentId -> number of open Subscribe streams (normally 0 or 1; briefly 2 during a reconnect overlap)
  private readonly openStreams = new Map<string, number>();
  // deploymentId -> pending "report offline" timer during the reconnect grace window
  private readonly graceTimers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Marks a Subscribe stream open. Cancels any pending grace timer (a reconnect within the window is not a
  // disconnect). Emits connected only on the false→true edge.
  markConnected(deploymentId: string): void {
    const grace = this.graceTimers.get(deploymentId);
    if (grace) {
      clearTimeout(grace);
      this.graceTimers.delete(deploymentId);
    }
    const wasConnected = this.isConnected(deploymentId);
    this.openStreams.set(deploymentId, (this.openStreams.get(deploymentId) ?? 0) + 1);
    if (!wasConnected) this.emit(deploymentId, true);
  }

  // Marks a Subscribe stream closed. When the last stream drops, starts the grace window; only after it
  // elapses with no reconnect is the agent reported offline (absorbs routine reconnect blips).
  markDisconnected(deploymentId: string): void {
    const remaining = Math.max(0, (this.openStreams.get(deploymentId) ?? 0) - 1);
    if (remaining > 0) {
      this.openStreams.set(deploymentId, remaining);
      return;
    }
    this.openStreams.delete(deploymentId);
    if (this.graceTimers.has(deploymentId)) return;
    const timer = setTimeout(() => {
      this.graceTimers.delete(deploymentId);
      if (!this.hasOpenStream(deploymentId)) this.emit(deploymentId, false);
    }, AGENT_DISCONNECT_GRACE_MS);
    this.graceTimers.set(deploymentId, timer);
  }

  // Whether the agent is currently reachable — an open stream, or within the reconnect grace window.
  isConnected(deploymentId: string): boolean {
    return this.hasOpenStream(deploymentId) || this.graceTimers.has(deploymentId);
  }

  private hasOpenStream(deploymentId: string): boolean {
    return (this.openStreams.get(deploymentId) ?? 0) > 0;
  }

  private emit(deploymentId: string, connected: boolean): void {
    this.eventEmitter.emit(DEPLOYMENT_AGENT_CONNECTIVITY_CHANGED_EVENT, { deploymentId, connected });
  }
}
