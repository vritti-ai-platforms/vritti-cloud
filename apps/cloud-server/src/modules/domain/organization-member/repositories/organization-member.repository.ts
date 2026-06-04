import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk';
import { and, asc, count, eq, type SQL } from '@vritti/api-sdk/drizzle-orm';
import { organizationMembers, users } from '@/db/schema';

export type OrganizationMemberRow = {
  id: string;
  userId: string;
  role: string;
  fullName: string;
  displayName: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: Date;
};

@Injectable()
export class OrganizationMemberRepository extends PrimaryBaseRepository<typeof users> {
  constructor(database: PrimaryDatabaseService) {
    super(database, users);
  }

  // Returns paginated organization members with user details for a given organization
  async findMembersForTable(
    organizationId: string,
    options: {
      where?: SQL;
      orderBy?: SQL[];
      limit?: number;
      offset?: number;
    },
  ): Promise<{ rows: OrganizationMemberRow[]; total: number }> {
    const { where, orderBy, limit = 20, offset = 0 } = options;
    const baseCondition = eq(organizationMembers.organizationId, organizationId);
    const combinedWhere = where ? and(baseCondition, where) : baseCondition;

    const [countResult, rows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(organizationMembers)
        .innerJoin(users, eq(users.id, organizationMembers.userId))
        .where(combinedWhere)
        .then((r) => r[0]?.total ?? 0),
      this.db
        .select({
          id: organizationMembers.id,
          userId: organizationMembers.userId,
          role: organizationMembers.role,
          fullName: users.fullName,
          displayName: users.displayName,
          email: users.email,
          profilePictureUrl: users.profilePictureUrl,
          createdAt: organizationMembers.createdAt,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(users.id, organizationMembers.userId))
        .where(combinedWhere)
        .orderBy(...(orderBy && orderBy.length > 0 ? orderBy : [asc(users.fullName)]))
        .limit(limit)
        .offset(offset),
    ]);
    return { rows: rows as OrganizationMemberRow[], total: Number(countResult) };
  }
}
