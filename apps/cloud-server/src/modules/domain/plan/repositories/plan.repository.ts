import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { and, asc, count, countDistinct, eq, inArray, type SQL } from '@vritti/api-sdk/drizzle-orm';
import type { Plan } from '@/db/schema';
import { businesses, organizations, planPrices, plans } from '@/db/schema';

export type PlanRow = Plan & { priceCount: number; businessName: string; countryCount: number };

@Injectable()
export class PlanDomainRepository extends PrimaryBaseRepository<typeof plans> {
  constructor(database: PrimaryDatabaseService) {
    super(database, plans);
  }

  // Finds a plan by its unique identifier
  async findById(id: string): Promise<Plan | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a plan by version + business + code (the version-scoped unique identity)
  async findByVersionBusinessCode(versionId: string, businessId: string, code: string): Promise<Plan | undefined> {
    return this.model.findFirst({ where: { versionId, businessId, code } });
  }

  // Returns the org's id, business (resolved code → id), and name for attaching a custom plan
  async findOrgForAttach(orgId: string): Promise<{ id: string; businessId: string; name: string } | undefined> {
    const rows = await this.db
      .select({ id: organizations.id, businessId: businesses.id, name: organizations.name })
      .from(organizations)
      .innerJoin(businesses, eq(businesses.code, organizations.businessCode))
      .where(eq(organizations.id, orgId))
      .limit(1);
    return rows[0];
  }

  // Subquery: the code of the business with this id — bridges plan.businessId (UUID) to org.businessCode
  private businessCodeFor(businessId: string) {
    return this.db.select({ code: businesses.code }).from(businesses).where(eq(businesses.id, businessId));
  }

  // Points an organization at a plan by code (attaches a custom plan to its org)
  async setOrgPlanCode(orgId: string, planCode: string): Promise<void> {
    await this.db.update(organizations).set({ planCode }).where(eq(organizations.id, orgId));
  }

  // Re-points every org on (business, oldCode) to newCode; returns the updated org ids
  async recodeOrganizations(businessId: string, oldCode: string, newCode: string): Promise<string[]> {
    const rows = (await this.db
      .update(organizations)
      .set({ planCode: newCode })
      .where(
        and(inArray(organizations.businessCode, this.businessCodeFor(businessId)), eq(organizations.planCode, oldCode)),
      )
      .returning({ id: organizations.id })) as { id: string }[];
    return rows.map((r) => r.id);
  }

  // Returns the name of an organization on this (business, planCode), if any
  async findAttachedOrgName(businessId: string, planCode: string): Promise<string | null> {
    const rows = await this.db
      .select({ name: organizations.name })
      .from(organizations)
      .where(
        and(
          inArray(organizations.businessCode, this.businessCodeFor(businessId)),
          eq(organizations.planCode, planCode),
        ),
      )
      .limit(1);
    return rows[0]?.name ?? null;
  }

  // Returns price and organization reference counts plus display meta for a given plan
  async getReferenceCounts(
    planId: string,
    businessId: string,
    planCode: string,
  ): Promise<{
    priceCount: number;
    orgCount: number;
    businessName: string;
    countryCount: number;
  }> {
    const [priceRows, orgRows, businessRows, countryRows] = await Promise.all([
      this.db
        .select({ n: count(planPrices.id) })
        .from(planPrices)
        .where(eq(planPrices.planId, planId)),
      this.db
        .select({ n: count(organizations.id) })
        .from(organizations)
        .where(
          and(
            inArray(organizations.businessCode, this.businessCodeFor(businessId)),
            eq(organizations.planCode, planCode),
          ),
        ),
      this.db
        .select({ name: businesses.name })
        .from(plans)
        .innerJoin(businesses, eq(businesses.id, plans.businessId))
        .where(eq(plans.id, planId)),
      this.db
        .select({ n: countDistinct(planPrices.countryId) })
        .from(planPrices)
        .where(eq(planPrices.planId, planId)),
    ]);
    return {
      priceCount: Number(priceRows[0]?.n ?? 0),
      orgCount: Number(orgRows[0]?.n ?? 0),
      businessName: businessRows[0]?.name ?? '',
      countryCount: Number(countryRows[0]?.n ?? 0),
    };
  }

  // Returns paginated plans with price counts, applying filter/sort/pagination
  async findAllWithCounts(options: {
    where?: SQL;
    orderBy?: SQL[];
    limit?: number;
    offset?: number;
  }): Promise<{ rows: PlanRow[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(plans)
        .where(where)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: plans.id,
          businessId: plans.businessId,
          name: plans.name,
          code: plans.code,
          content: plans.content,
          maxSites: plans.maxSites,
          createdAt: plans.createdAt,
          updatedAt: plans.updatedAt,
          isCustom: plans.isCustom,
          businessName: businesses.name,
          priceCount: count(planPrices.id),
          countryCount: countDistinct(planPrices.countryId),
        })
        .from(plans)
        .innerJoin(businesses, eq(businesses.id, plans.businessId))
        .leftJoin(planPrices, eq(planPrices.planId, plans.id))
        .groupBy(plans.id, businesses.name)
        .where(where)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(plans.name)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as PlanRow[], total: Number(countResult) };
  }
}
