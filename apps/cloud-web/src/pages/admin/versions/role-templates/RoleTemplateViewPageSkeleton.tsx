import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { TabsSkeleton } from '@vritti/quantum-ui/Tabs';

export const RoleTemplateViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />

    {/* Role info — 3 columns */}
    <div className="grid grid-cols-3 gap-4">
      <CardSkeleton count={3}>
        <div className="flex items-center gap-4 p-6">
          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-8" />
          </div>
        </div>
      </CardSkeleton>
    </div>

    <TabsSkeleton count={1} tabWidths={['w-24']} />

    <DangerZoneSkeleton />
  </div>
);
