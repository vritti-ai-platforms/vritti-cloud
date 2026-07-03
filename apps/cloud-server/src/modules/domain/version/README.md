# Version Domain — Catalog Pipeline

How an app version's feature catalog gets authored, snapshotted, and pushed to core.

## Pipeline

1. **Create features + permissions**
   `feature/root/services/feature.service.ts`, `feature/feature-permission/services/feature-permission.service.ts`

2. **Link microfrontends** (per-platform web/mobile routes onto features)
   `microfrontend/services/microfrontend.service.ts` (upsert the MF), `feature.service.ts` `setMicrofrontend` (link it)

3. **Assign features to businesses/apps**
   `business/root/services/version-business.service.ts`, `business/app/root/services/app.service.ts`,
   `business/feature/services/business-feature.service.ts`

4. **Plan unlocks** (what each plan enables, per feature × platform × permission)
   `../plan/services/plan.service.ts`, `../plan/services/plan-feature-permission.service.ts`

5. **Role-template grants** (default role permissions, same per-platform shape)
   `business/role-template/root/services/role-template.service.ts`,
   `business/role-template/role-template-permission/services/role-template-permission.service.ts`

6. **Build snapshot** — assembles all of the above into one `VersionSnapshot` document stored on the version
   `root/services/version-snapshot.builder.ts` (the real assembly), triggered by `root/services/version.service.ts` `createSnapshot`

7. **Sign + push to core** — signs the snapshot inputs and syncs entitlements/roles/BU locks to core deployments
   `modules/core-server/services/catalog-sync.service.ts`

## Notes

- `modules/domain/catalog/*.builder.ts` are re-export shims of `@vritti/api-sdk/catalog-resolver` — the shared
  resolver used by both cloud and core. The only real builder in this repo is `version-snapshot.builder.ts`.
- Snapshot shape (`VersionSnapshot`, `SnapshotRoleTemplate`, `FeatureUnlocks`, `SNAPSHOT_SCHEMA_VERSION`) is
  defined in api-sdk `src/catalog-resolver/types.ts` — change it there, not here.
