import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const BUViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions={false} />
    <TabsSkeleton count={2} tabWidths={['w-20', 'w-28']} />
    <DangerZoneSkeleton />
  </div>
);
