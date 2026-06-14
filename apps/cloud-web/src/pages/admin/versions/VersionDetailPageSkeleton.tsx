import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const VersionDetailPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />
    <TabsSkeleton count={4} tabWidths={['w-20', 'w-28', 'w-20', 'w-24']} />
  </div>
);
