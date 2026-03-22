# vritti-cloud

pnpm workspace monorepo containing the Vritti Cloud backend and frontend.

## Apps

| App | Stack | Port | Path |
|-----|-------|------|------|
| cloud-server | NestJS + Fastify + Drizzle | 3000 | `apps/cloud-server/` |
| cloud-web | React + Rsbuild + Tailwind v4 | 3012 | `apps/cloud-web/` |

## External Dependencies

`@vritti/quantum-ui` and `@vritti/api-sdk` are linked via pnpm overrides (see `pnpm-workspace.yaml`). They live outside this repo at `../quantum-ui` and `../api-sdk`.

## Commands

```bash
pnpm dev              # Start both apps in parallel
pnpm dev:ssl          # Start both with HTTPS
pnpm build            # Build all projects
pnpm lint             # Lint all projects (Biome)
pnpm test             # Run unit tests (Jest for server, Vitest for web)
pnpm test:e2e         # Run e2e tests (Supertest for server, Playwright for web)
pnpm check            # Biome check --write across all
nx graph              # Show project dependency graph
npx nx release        # Version bump + changelog (conventional commits)
```

## Testing

| Scope | Tool | Location |
|-------|------|----------|
| Server unit | Jest + SWC | `apps/cloud-server/` |
| Web unit/component | Vitest + Testing Library | `apps/cloud-web/` |
| Server e2e | Jest + Supertest | `e2e/cloud-server-e2e/` |
| Web e2e | Playwright | `e2e/cloud-web-e2e/` |

## Structure

```
vritti-cloud/
├── apps/
│   ├── cloud-server/     # NestJS backend
│   └── cloud-web/        # React frontend
├── e2e/
│   ├── cloud-server-e2e/ # API e2e tests
│   └── cloud-web-e2e/    # Browser e2e tests
├── libs/                  # Future shared packages
├── .claude/rules/         # 15 convention rule files
├── biome.json             # Shared linter/formatter
└── nx.json                # Nx config with versioning
```

## Conventions

See `.claude/rules/` for detailed pattern documentation:
- `swagger-docs.md` — API controller Swagger docs pattern
- `error-handling.md` — RFC 9457 exception patterns
- `auth-architecture.md` — Auth system facts and constraints
- `frontend-conventions.md` — Frontend patterns and component usage
- `backend-controller.md` — Controller thin layer rules
- `backend-service.md` — Service business logic rules
- `backend-repository.md` — Repository data access rules
- `backend-dto.md` — DTO organization (request/response/entity)
- `frontend-hook.md` — TanStack Query hook conventions
- `frontend-service.md` — Axios service conventions
- `frontend-file-structure.md` — File/folder organization
- `comment-style.md` — Comment style rules
- `export-conventions.md` — Export patterns
- `apps/cloud-server/.claude/rules/backend-service-responses.md` — create() returns entity DTO, update/delete returns SuccessResponseDto
- `apps/cloud-web/.claude/rules/frontend-service-responses.md` — No MutationResponse; create returns entity, update/delete returns SuccessResponse
