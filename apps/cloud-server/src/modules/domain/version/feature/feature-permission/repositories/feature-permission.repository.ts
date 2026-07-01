import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, eq, inArray, type SQL, sql } from '@vritti/api-sdk/drizzle-orm';
import type { FeaturePermission, NewFeaturePermission } from '@/db/schema';
import {
  businesses,
  featurePermissions,
  features,
  permissionBusinesses,
  planFeaturePermissions,
  plans,
  roleTemplateFeaturePermissions,
  roleTemplates,
} from '@/db/schema';

export type FeaturePermissionTableRow = FeaturePermission & {
  featureName: string | null;
  businessIds: string[];
};

export interface BusinessFeaturePermission {
  id: string;
  code: string;
  label: string;
  isGlobal: boolean;
}

// A plan / role-template that references a permission, carrying its owning business
export interface PermissionUsageRef {
  businessId: string;
  businessName: string;
  id: string;
  name: string;
}

@Injectable()
export class FeaturePermissionRepository extends PrimaryBaseRepository<typeof featurePermissions> {
  constructor(database: PrimaryDatabaseService) {
    super(database, featurePermissions);
  }

  // Finds a permission row by its identifier
  async findById(id: string): Promise<FeaturePermission | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Returns permission rows visible to a business (global or linked) for the data table
  async findForBusinessTable(
    versionId: string,
    businessId: string,
    options: { featureId?: string; where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: FeaturePermissionTableRow[]; count: number }> {
    const visibilityWhere = sql`(${featurePermissions.isGlobal} = true or exists (select 1 from ${permissionBusinesses} pb where pb.feature_permission_id = ${featurePermissions.id} and pb.business_id = ${businessId}))`;
    const conditions: SQL[] = [eq(featurePermissions.versionId, versionId), visibilityWhere];
    if (options.featureId) {
      conditions.push(eq(featurePermissions.featureId, options.featureId));
    }
    if (options.where) {
      conditions.push(options.where);
    }

    return this.findAllAndCount<FeaturePermissionTableRow>({
      select: {
        id: featurePermissions.id,
        versionId: featurePermissions.versionId,
        featureId: featurePermissions.featureId,
        featureName: features.name,
        code: featurePermissions.code,
        label: featurePermissions.label,
        isGlobal: featurePermissions.isGlobal,
        sortOrder: featurePermissions.sortOrder,
        businessIds: sql<string[]>`coalesce(array_remove(array_agg(${permissionBusinesses.businessId}), null), '{}')`,
      },
      leftJoins: [
        { table: features, on: eq(features.id, featurePermissions.featureId) },
        { table: permissionBusinesses, on: eq(permissionBusinesses.featurePermissionId, featurePermissions.id) },
      ],
      where: and(...conditions),
      groupBy: [
        featurePermissions.id,
        featurePermissions.versionId,
        featurePermissions.featureId,
        features.name,
        featurePermissions.code,
        featurePermissions.label,
        featurePermissions.isGlobal,
        featurePermissions.sortOrder,
      ],
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Returns the permission rows owned by a feature for the data table
  async findForFeatureTable(
    versionId: string,
    featureId: string,
    options: { where?: SQL; orderBy?: SQL[]; limit: number; offset: number },
  ): Promise<{ result: FeaturePermissionTableRow[]; count: number }> {
    const conditions: SQL[] = [
      eq(featurePermissions.versionId, versionId),
      eq(featurePermissions.featureId, featureId),
    ];
    if (options.where) {
      conditions.push(options.where);
    }

    return this.findAllAndCount<FeaturePermissionTableRow>({
      select: {
        id: featurePermissions.id,
        versionId: featurePermissions.versionId,
        featureId: featurePermissions.featureId,
        featureName: features.name,
        code: featurePermissions.code,
        label: featurePermissions.label,
        isGlobal: featurePermissions.isGlobal,
        sortOrder: featurePermissions.sortOrder,
        businessIds: sql<string[]>`coalesce(array_remove(array_agg(${permissionBusinesses.businessId}), null), '{}')`,
      },
      leftJoins: [
        { table: features, on: eq(features.id, featurePermissions.featureId) },
        { table: permissionBusinesses, on: eq(permissionBusinesses.featurePermissionId, featurePermissions.id) },
      ],
      where: and(...conditions),
      groupBy: [
        featurePermissions.id,
        featurePermissions.versionId,
        featurePermissions.featureId,
        features.name,
        featurePermissions.code,
        featurePermissions.label,
        featurePermissions.isGlobal,
        featurePermissions.sortOrder,
      ],
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset,
    });
  }

  // Returns the permissions of a feature that apply to a business (global or business-linked)
  async findVisibleForFeature(featureId: string, businessId: string): Promise<BusinessFeaturePermission[]> {
    const rows = await this.db
      .select({
        id: featurePermissions.id,
        code: featurePermissions.code,
        label: featurePermissions.label,
        isGlobal: featurePermissions.isGlobal,
      })
      .from(featurePermissions)
      .where(
        and(
          eq(featurePermissions.featureId, featureId),
          sql`(${featurePermissions.isGlobal} = true or exists (select 1 from ${permissionBusinesses} pb where pb.feature_permission_id = ${featurePermissions.id} and pb.business_id = ${businessId}))`,
        ),
      )
      .orderBy(featurePermissions.sortOrder);
    return rows;
  }

  // Business-wise usage of a permission: the plans that unlock it + role templates that grant it (distinct per platform)
  async findUsage(permissionId: string): Promise<{ plans: PermissionUsageRef[]; roleTemplates: PermissionUsageRef[] }> {
    const [planRows, roleRows] = await Promise.all([
      this.db
        .selectDistinct({
          businessId: plans.businessId,
          businessName: businesses.name,
          id: plans.id,
          name: plans.name,
        })
        .from(planFeaturePermissions)
        .innerJoin(plans, eq(plans.id, planFeaturePermissions.planId))
        .innerJoin(businesses, eq(businesses.id, plans.businessId))
        .where(eq(planFeaturePermissions.featurePermissionId, permissionId))
        .orderBy(businesses.name, plans.name),
      this.db
        .selectDistinct({
          businessId: roleTemplates.businessId,
          businessName: businesses.name,
          id: roleTemplates.id,
          name: roleTemplates.name,
        })
        .from(roleTemplateFeaturePermissions)
        .innerJoin(roleTemplates, eq(roleTemplates.id, roleTemplateFeaturePermissions.roleTemplateId))
        .innerJoin(businesses, eq(businesses.id, roleTemplates.businessId))
        .where(eq(roleTemplateFeaturePermissions.featurePermissionId, permissionId))
        .orderBy(businesses.name, roleTemplates.name),
    ]);
    return { plans: planRows, roleTemplates: roleRows };
  }

  // Returns the business ids a permission is linked to
  async findBusinessIds(featurePermissionId: string): Promise<string[]> {
    const rows = await this.db
      .select({ businessId: permissionBusinesses.businessId })
      .from(permissionBusinesses)
      .where(eq(permissionBusinesses.featurePermissionId, featurePermissionId));
    return rows.map((r) => r.businessId);
  }

  // Checks whether a permission code already exists within a feature
  async existsByCode(featureId: string, code: string, excludeId?: string): Promise<boolean> {
    const conditions: SQL[] = [eq(featurePermissions.featureId, featureId), eq(featurePermissions.code, code)];
    if (excludeId) {
      conditions.push(sql`${featurePermissions.id} <> ${excludeId}`);
    }
    return this.exists(and(...conditions) as SQL);
  }

  // Inserts a permission row (and its business links when non-global) in a transaction and returns it
  async createWithBusinesses(row: NewFeaturePermission, businessIds: string[]): Promise<FeaturePermission> {
    return this.transaction(async (tx) => {
      const [created] = (await tx.insert(featurePermissions).values(row).returning()) as FeaturePermission[];
      if (!created.isGlobal && businessIds.length > 0) {
        await tx.insert(permissionBusinesses).values(
          businessIds.map((businessId) => ({
            versionId: created.versionId,
            featurePermissionId: created.id,
            businessId,
          })),
        );
      }
      return created;
    });
  }

  // Inserts many permissions (+ their business links) in a single transaction
  async bulkCreate(items: { row: NewFeaturePermission; businessIds: string[] }[]): Promise<number> {
    if (items.length === 0) return 0;
    return this.transaction(async (tx) => {
      const created = (await tx
        .insert(featurePermissions)
        .values(items.map((i) => i.row))
        .returning()) as FeaturePermission[];
      const junctions = created.flatMap((perm, idx) =>
        perm.isGlobal
          ? []
          : items[idx].businessIds.map((businessId) => ({
              versionId: perm.versionId,
              featurePermissionId: perm.id,
              businessId,
            })),
      );
      if (junctions.length > 0) await tx.insert(permissionBusinesses).values(junctions);
      return created.length;
    });
  }

  // Updates a permission row and replaces its business links in a transaction and returns it
  async updateWithBusinesses(
    id: string,
    versionId: string,
    values: Partial<Pick<NewFeaturePermission, 'code' | 'label' | 'isGlobal' | 'sortOrder'>>,
    businessIds: string[] | undefined,
  ): Promise<FeaturePermission> {
    return this.transaction(async (tx) => {
      const [updated] = (await tx
        .update(featurePermissions)
        .set(values)
        .where(eq(featurePermissions.id, id))
        .returning()) as FeaturePermission[];

      const shouldReplaceLinks = businessIds !== undefined || values.isGlobal !== undefined;
      if (shouldReplaceLinks) {
        await tx.delete(permissionBusinesses).where(eq(permissionBusinesses.featurePermissionId, id));
        if (!updated.isGlobal && businessIds && businessIds.length > 0) {
          await tx.insert(permissionBusinesses).values(
            businessIds.map((businessId) => ({
              versionId,
              featurePermissionId: id,
              businessId,
            })),
          );
        }
      }
      return updated;
    });
  }

  // Deletes a permission row by ID (junction rows cascade)
  async deleteOne(id: string): Promise<void> {
    await this.db.delete(featurePermissions).where(eq(featurePermissions.id, id));
  }

  // Returns the permission codes for a feature (used by the snapshot)
  async findCodesByFeatureId(featureId: string): Promise<string[]> {
    const rows = await this.db
      .select({ code: featurePermissions.code })
      .from(featurePermissions)
      .where(eq(featurePermissions.featureId, featureId));
    return rows.map((r) => r.code);
  }

  // Returns permission rows (featureId + code) for multiple features — used by runtime resolution
  async findByFeatureIds(featureIds: string[]): Promise<Array<{ featureId: string; code: string }>> {
    if (featureIds.length === 0) return [];
    return this.db
      .select({ featureId: featurePermissions.featureId, code: featurePermissions.code })
      .from(featurePermissions)
      .where(inArray(featurePermissions.featureId, featureIds));
  }
}
