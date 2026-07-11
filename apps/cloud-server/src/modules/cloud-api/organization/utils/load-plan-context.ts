import type { SnapshotPlan, VersionSnapshot } from '@domain/version/root/services/version-snapshot.builder';
import { NotFoundException } from '@vritti/api-sdk/exceptions';
import type { Deployment, Organization } from '@/db/schema';
import type { CoreVersionRepository } from '@/modules/core-server/repositories/core-version.repository';

// Loads the org's version snapshot + its plan (the ceiling the lock editors work within); throws NotFound if either is missing
export async function loadPlanContext(
  coreVersionRepository: CoreVersionRepository,
  org: Organization,
  deployment: Deployment,
): Promise<{ snapshot: VersionSnapshot; plan: SnapshotPlan }> {
  const appVersion = await coreVersionRepository.findByVersion(deployment.version);
  const snapshot = (appVersion?.snapshot as VersionSnapshot | null) ?? null;
  const plan = snapshot?.businesses?.[org.businessCode]?.plans?.[org.planCode];
  if (!snapshot || !plan) throw new NotFoundException('Plan not found.');
  return { snapshot, plan };
}
