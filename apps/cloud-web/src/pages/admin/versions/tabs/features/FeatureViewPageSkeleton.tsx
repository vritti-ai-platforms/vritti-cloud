import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const FeatureViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />
    <TabsSkeleton count={2} tabWidths={['w-28', 'w-24']} />
    <DangerZoneSkeleton />
  </div>
);
