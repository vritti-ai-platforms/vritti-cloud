import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService, type TypedDrizzleClient } from '@vritti/api-sdk';
import { eq, inArray } from '@vritti/api-sdk/drizzle-orm';
import type { FeaturePermission, NewFeaturePermission } from '@/db/schema';
import { featurePermissions } from '@/db/schema';

@Injectable()
export class FeaturePermissionRepository extends PrimaryBaseRepository<typeof featurePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, featurePermissions);
  }

  // Finds all permission rows for a feature
  async findByFeatureId(featureId: string): Promise<FeaturePermission[]> {
    return this.model.findMany({ where: { featureId } });
  }

  // Deletes all permission rows for a feature
  async deleteByFeatureId(featureId: string, tx?: TypedDrizzleClient): Promise<void> {
    const db = tx ?? this.db;
    await db.delete(featurePermissions).where(eq(featurePermissions.featureId, featureId));
  }

  // Bulk-inserts feature permission rows
  async bulkCreate(rows: NewFeaturePermission[], tx?: TypedDrizzleClient): Promise<void> {
    if (rows.length === 0) return;
    const db = tx ?? this.db;
    await db.insert(featurePermissions).values(rows);
  }

  // Checks whether a feature has at least one permission defined
  async hasPermissions(featureId: string): Promise<boolean> {
    return this.exists(eq(featurePermissions.featureId, featureId));
  }

  // Finds all permission rows for multiple features
  async findByFeatureIds(featureIds: string[]): Promise<FeaturePermission[]> {
    if (featureIds.length === 0) return [];
    return this.db.select().from(featurePermissions).where(inArray(featurePermissions.featureId, featureIds));
  }
}
