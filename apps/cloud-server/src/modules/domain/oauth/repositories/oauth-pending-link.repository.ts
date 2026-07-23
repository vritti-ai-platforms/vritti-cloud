import { Injectable } from '@nestjs/common';
import { PrimaryBaseRepository, PrimaryDatabaseService } from '@vritti/api-sdk/database';
import { eq, lt } from '@vritti/api-sdk/drizzle-orm';
import { type NewOAuthPendingLink, type OAuthPendingLink, oauthPendingLinks } from '@/db/schema';

@Injectable()
export class OAuthPendingLinkDomainRepository extends PrimaryBaseRepository<typeof oauthPendingLinks> {
  constructor(database: PrimaryDatabaseService) {
    super(database, oauthPendingLinks);
  }

  // Replaces any in-flight pending link for the user with a fresh one (one pending link per user)
  async createForUser(data: NewOAuthPendingLink): Promise<OAuthPendingLink> {
    await this.deleteMany(eq(oauthPendingLinks.userId, data.userId));
    return this.create(data);
  }

  // Finds the pending link stashed for a user
  async findByUserId(userId: string): Promise<OAuthPendingLink | undefined> {
    return this.findOne({ userId });
  }

  // Removes the pending link for a user (one-time consumption)
  async deleteByUserId(userId: string): Promise<void> {
    await this.deleteMany(eq(oauthPendingLinks.userId, userId));
  }

  // Removes all expired pending links from the database
  async deleteExpired(): Promise<{ count: number }> {
    return this.deleteMany(lt(oauthPendingLinks.expiresAt, new Date()));
  }
}
