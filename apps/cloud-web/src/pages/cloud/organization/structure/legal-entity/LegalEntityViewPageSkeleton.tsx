import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const LegalEntityViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions />
    <TabsSkeleton count={3} tabWidths={['w-20', 'w-32', 'w-28']} />
  </div>
);
