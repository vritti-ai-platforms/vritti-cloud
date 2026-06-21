import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, inArray } from '@vritti/api-sdk/drizzle-orm';
import type { Version } from '@/db/schema';
import {
  appFeatures,
  apps,
  businesses,
  featureMicrofrontends,
  featurePermissions,
  features,
  microfrontends,
  permissionBusinesses,
  planFeaturePermissions,
  plans,
  roleTemplateFeaturePermissions,
  roleTemplates,
  versionBusinesses,
  versions,
} from '@/db/schema';
import type { SnapshotData } from '../services/version-snapshot.builder';

@Injectable()
export class VersionRepository extends PrimaryBaseRepository<typeof versions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, versions);
  }

  // Finds a version by its unique identifier
  async findById(id: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a version by its unique version string
  async findByVersion(version: string): Promise<Version | undefined> {
    return this.model.findFirst({ where: { version } });
  }

  // Returns all versions ordered by creation date descending
  async findAllForTable(): Promise<{ result: Version[]; count: number }> {
    const result = await this.model.findMany({ orderBy: { createdAt: 'desc' } });
    return { result, count: result.length };
  }

  // Fetches every versioned table for one version (raw rows; assembly happens in the snapshot builder)
  async findSnapshotData(versionId: string): Promise<SnapshotData> {
    // Plans are version-scoped; plan_feature_permissions (the unlocked set) hangs off plan ids
    const planRows = await this.db.select().from(plans).where(eq(plans.versionId, versionId));
    const planIds = planRows.map((p) => p.id);

    const [
      featureRows,
      permissionRows,
      mfRows,
      featureMfRows,
      appRows,
      appFeatureRows,
      roleRows,
      rolePermRows,
      businessRows,
      permissionBusinessRows,
      planFpRows,
    ] = await Promise.all([
      this.db.select().from(features).where(eq(features.versionId, versionId)),
      this.db.select().from(featurePermissions).where(eq(featurePermissions.versionId, versionId)),
      this.db.select().from(microfrontends).where(eq(microfrontends.versionId, versionId)),
      this.db.select().from(featureMicrofrontends).where(eq(featureMicrofrontends.versionId, versionId)),
      this.db.select().from(apps).where(eq(apps.versionId, versionId)),
      this.db.select().from(appFeatures).where(eq(appFeatures.versionId, versionId)),
      this.db.select().from(roleTemplates).where(eq(roleTemplates.versionId, versionId)),
      this.db
        .select()
        .from(roleTemplateFeaturePermissions)
        .where(eq(roleTemplateFeaturePermissions.versionId, versionId)),
      this.db
        .select({ id: businesses.id, code: businesses.code, name: businesses.name })
        .from(versionBusinesses)
        .innerJoin(businesses, eq(businesses.id, versionBusinesses.businessId))
        .where(eq(versionBusinesses.versionId, versionId)),
      this.db
        .select({
          featurePermissionId: permissionBusinesses.featurePermissionId,
          businessId: permissionBusinesses.businessId,
        })
        .from(permissionBusinesses)
        .where(eq(permissionBusinesses.versionId, versionId)),
      planIds.length
        ? this.db.select().from(planFeaturePermissions).where(inArray(planFeaturePermissions.planId, planIds))
        : Promise.resolve([]),
    ]);

    return {
      features: featureRows,
      permissions: permissionRows,
      microfrontends: mfRows,
      featureMicrofrontends: featureMfRows,
      apps: appRows,
      appFeatures: appFeatureRows,
      roleTemplates: roleRows,
      roleTemplatePermissions: rolePermRows,
      plans: planRows,
      planFeaturePermissions: planFpRows,
      businesses: businessRows,
      permissionBusinesses: permissionBusinessRows,
    };
  }
}
