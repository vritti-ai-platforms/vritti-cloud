// Enroll token lifetime (1 hour) — the operator pastes it into the agent before it expires
export const ENROLL_TOKEN_TTL_MS = 60 * 60 * 1000;

// Allowed clock skew (seconds) between the agent's X-Vritti-Timestamp and the server clock — replay window guard
export const AGENT_TIMESTAMP_SKEW_SECONDS = 300;

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
