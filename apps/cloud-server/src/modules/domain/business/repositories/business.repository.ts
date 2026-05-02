import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { eq, inArray, sql } from '@vritti/api-sdk/drizzle-orm';
import type { Business } from '@/db/schema';
import { businesses, deploymentBusinessPlans, organizations, prices } from '@/db/schema';

@Injectable()
export class BusinessRepository extends PrimaryBaseRepository<typeof businesses> {
  constructor(database: PrimaryDatabaseService) {
    super(database, businesses);
  }

  // Returns all businesses ordered by name ascending
  async findAll(): Promise<Business[]> {
    return this.model.findMany({ orderBy: { name: 'asc' } });
  }

  // Finds a business by its unique identifier
  async findById(id: string): Promise<Business | undefined> {
    return this.model.findFirst({ where: { id } });
  }

  // Finds a business by its unique code
  async findByCode(code: string): Promise<Business | undefined> {
    return this.model.findFirst({ where: { code } });
  }

  // Returns a set of business IDs that have at least one reference (cannot be deleted)
  async findReferencedIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const [orgs, pricesList, plans] = await Promise.all([
      this.db.select({ id: organizations.businessId }).from(organizations).where(inArray(organizations.businessId, ids)),
      this.db.select({ id: prices.businessId }).from(prices).where(inArray(prices.businessId, ids)),
      this.db
        .select({ id: deploymentBusinessPlans.businessId })
        .from(deploymentBusinessPlans)
        .where(inArray(deploymentBusinessPlans.businessId, ids)),
    ]);
    const referenced = new Set<string>();
    for (const row of [...orgs, ...pricesList, ...plans]) {
      if (row.id) referenced.add(row.id);
    }
    return referenced;
  }

  // Counts references to this business across organizations, prices, and deployment plans
  async countReferences(id: string): Promise<{ organizations: number; prices: number; deploymentPlans: number }> {
    const [orgsResult, pricesResult, plansResult] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(organizations).where(eq(organizations.businessId, id)),
      this.db.select({ count: sql<number>`count(*)` }).from(prices).where(eq(prices.businessId, id)),
      this.db.select({ count: sql<number>`count(*)` }).from(deploymentBusinessPlans).where(eq(deploymentBusinessPlans.businessId, id)),
    ]);
    return {
      organizations: Number(orgsResult[0]?.count ?? 0),
      prices: Number(pricesResult[0]?.count ?? 0),
      deploymentPlans: Number(plansResult[0]?.count ?? 0),
    };
  }
}
