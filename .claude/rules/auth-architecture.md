---
description: Auth system architecture facts and constraints
paths:
  - "src/**/auth/**/*.ts"
---

# Auth Architecture

These are established facts. Do NOT change these patterns without explicit approval.

## Password & Encryption
- Password hashing: **Argon2id** via EncryptionService (NOT bcrypt)

## Routes
- Auth routes: `/auth/*` (NOT `/cloud-api/auth/*`)
- Onboarding routes: `/onboarding/*` (NOT `/cloud-api/onboarding/*`)
- Token recovery: `GET /auth/token` (NOT POST)

## Sessions & Tokens
- Session types: ONBOARDING, CLOUD, COMPANY, RESET, ADMIN
- Use `@RequireSession(SessionTypeValues.ADMIN)` to restrict endpoints to a session type
- `@RequireSession()` replaces the old `@Admin()`, `@Onboarding()`, `@Reset()` decorators
- Default session types configured via `configureApiSdk({ guard: { defaultSessionTypes: ['CLOUD'] } })`
- cloud-server defaults to `['CLOUD']`
- ONBOARDING session: 24h expiry (NOT 10 min)
- Refresh token: httpOnly cookie only (NOT in response body)
- JWT payload: `{ userId, type, refreshTokenHash }` (NOT sub/email/sessionType)
- sameSite cookie: `strict` (NOT lax)

## Domain Modules
- 17 domain modules in `src/modules/domain/` (services + repos, NO controllers/DTOs)
- `@domain/` path alias resolves to `src/modules/domain/*`
- API layers (admin-api, cloud-api, select-api) contain controllers only — they import domain services
- `ServicesModule` is `@Global()` — no need to import in every API module
- Zero `forwardRef`, zero duplicate providers
- No `AdminApiModule` wrapper — individual admin API modules registered directly in AppModule

## OAuth
- OAuth state: PostgreSQL `oauth_states` table (NOT Redis)

## MFA
- MFA challenge store: in-memory Map (NOT database)

## Cookie Configuration
- Cookie name from `REFRESH_COOKIE_NAME` env var (default: `vritti_refresh`)
- Cookie domain from `REFRESH_COOKIE_DOMAIN` env var
- Use `getRefreshCookieName()` and `getRefreshCookieOptionsFromConfig()` helpers
