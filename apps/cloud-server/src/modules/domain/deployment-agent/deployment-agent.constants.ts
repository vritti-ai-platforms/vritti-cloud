// Enroll token lifetime (1 hour) — the operator pastes it into the agent before it expires
export const ENROLL_TOKEN_TTL_MS = 60 * 60 * 1000;

// Allowed clock skew (seconds) between the agent's X-Vritti-Timestamp and the server clock — replay window guard
export const AGENT_TIMESTAMP_SKEW_SECONDS = 300;

// Internal event fired (payload: deploymentId) whenever a deployment's desired-state may have changed — an
// open agent Subscribe stream listens and immediately re-evaluates/pushes the signed desired-state.
export const DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT = 'deployment.desired-state.changed';

// Internal event fired (payload: { agent, report }) after the agent reports status — the admin SSE stream
// listens and relays the just-reported status to any watching browser (live cockpit, no DB re-read).
export const DEPLOYMENT_AGENT_STATUS_CHANGED_EVENT = 'deployment.agent.status-changed';

// Internal event fired (payload: { deploymentId, connected }) when the agent's Subscribe stream opens or
// closes — the admin SSE stream relays it so the cockpit shows "agent offline" the moment it disconnects.
export const DEPLOYMENT_AGENT_CONNECTIVITY_CHANGED_EVENT = 'deployment.agent.connectivity-changed';

// Internal event fired (payload: deploymentId) to ask a connected agent to report its status NOW (no
// reconcile) — emitted when a browser opens the cockpit so first paint is direct from the agent, not the DB.
export const DEPLOYMENT_AGENT_REQUEST_STATUS_EVENT = 'deployment.agent.request-status';

// Internal event fired (payload: deploymentId) to ask a connected agent to reconcile NOW — clears its backoff
// window and re-applies the desired state immediately. The Subscribe handler turns it into a ForceRecheck
// command down the stream; the "Recheck now" admin action emits it (avoids waiting on the 5-min resync).
export const DEPLOYMENT_AGENT_FORCE_RECHECK_EVENT = 'deployment.agent.force-recheck';

// Internal event fired (payload: { deploymentId, service }) to recreate ONE service's container so it picks up
// the latest env/secrets. The Subscribe handler turns it into a Recreate command down the stream; the
// per-service "Recreate" admin action emits it.
export const DEPLOYMENT_AGENT_RECREATE_EVENT = 'deployment.agent.recreate';

// Services the agent can recreate on demand (must match the agent's spec names / reported service keys).
export const RECREATABLE_SERVICES = [
  'postgres',
  'redis',
  'nats',
  'commerce-service',
  'core-server',
  'gitea',
  'nginx',
] as const;

// Grace window (ms) before a dropped Subscribe stream is reported as offline — absorbs the agent's brief
// reconnect backoff so the cockpit doesn't flap "offline" on a routine reconnect.
export const AGENT_DISCONNECT_GRACE_MS = 6_000;

// Live-log events. START/STOP (payload: { deploymentId, target, tailLines? }) are emitted by the logs SSE
// relay on the first/last browser watching a container's logs; the Subscribe handler turns them into
// StartLogs/StopLogs commands. LINE (payload: { deploymentId, target, stream, ts, line }) is emitted by the
// agent's PushLogs handler per tailed line; the logs relay fans it out to watching browsers.
export const DEPLOYMENT_AGENT_START_LOGS_EVENT = 'deployment.agent.start-logs';
export const DEPLOYMENT_AGENT_STOP_LOGS_EVENT = 'deployment.agent.stop-logs';
export const DEPLOYMENT_AGENT_LOG_LINE_EVENT = 'deployment.agent.log-line';

// Initial backlog + ring-buffer size for a container's live log tail (lines).
export const AGENT_LOG_TAIL_LINES = 500;

// Keepalive/backstop cadence for the agent Subscribe stream. A frame is sent at least this often so
// Cloudflare's ~100s idle timeout never closes an idle stream; it also re-evaluates the desired-state,
// so a missed change event is still delivered within this window (belt-and-suspenders with the event).
export const AGENT_SUBSCRIBE_KEEPALIVE_MS = 30_000;

// Default pinned stack images for a managed deployment — overridable per key via AGENT_IMAGE_* env
export const DEFAULT_STACK_IMAGES = {
  coreServer: 'ghcr.io/vritti-ai-platforms/core-server:latest-main',
  commerceService: 'ghcr.io/vritti-ai-platforms/commerce-service:latest-main',
  postgres: 'ghcr.io/vritti-ai-platforms/postgres-pgbackrest:18.4',
  redis: 'redis:7',
  nats: 'nats:2',
  gitea: 'gitea/gitea:1.27',
  nginx: 'nginx:1',
} as const;

// Static web artifacts the managed edge serves off the wildcard (*.<base>) origin. Path "" is the
// host SPA (core-web) at web root; a non-empty path is a module-federation remote extracted to that
// subdir (its core-web prodPath) so core-web loads it same-origin at /<path>/mf-manifest.json. Serving
// the full published MF set is harmless — core-web's runtime feature catalog only loads the remotes a
// tenant is entitled to. Overridable wholesale via the AGENT_WEB_BUNDLES env (JSON array).
export const DEFAULT_WEB_BUNDLES: { artifact: string; path: string }[] = [
  { artifact: 'ghcr.io/vritti-ai-platforms/core-web:latest-main', path: '' },
  { artifact: 'ghcr.io/vritti-ai-platforms/commerce-mf:latest-main', path: 'commerce-mf' },
  { artifact: 'ghcr.io/vritti-ai-platforms/gitea-mf:latest-main', path: 'gitea-mf' },
];

// Env var overriding the web-bundle set wholesale (JSON array of { artifact, path }); falls back to DEFAULT_WEB_BUNDLES
export const WEB_BUNDLES_ENV_KEY = 'AGENT_WEB_BUNDLES';

// Env var overriding each image reference (falls back to DEFAULT_STACK_IMAGES)
export const IMAGE_ENV_KEYS = {
  coreServer: 'AGENT_IMAGE_CORE_SERVER',
  commerceService: 'AGENT_IMAGE_COMMERCE_SERVICE',
  postgres: 'AGENT_IMAGE_POSTGRES',
  redis: 'AGENT_IMAGE_REDIS',
  nats: 'AGENT_IMAGE_NATS',
  gitea: 'AGENT_IMAGE_GITEA',
  nginx: 'AGENT_IMAGE_NGINX',
} as const;
