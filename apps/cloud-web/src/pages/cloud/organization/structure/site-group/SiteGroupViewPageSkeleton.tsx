import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const SiteGroupViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions />
    <TabsSkeleton count={2} tabWidths={['w-20', 'w-28']} />
  </div>
);
