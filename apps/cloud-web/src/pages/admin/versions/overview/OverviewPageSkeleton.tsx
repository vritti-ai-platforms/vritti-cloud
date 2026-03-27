import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const OverviewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />

    {/* Info cards — 2 columns */}
    <div className="grid grid-cols-2 gap-4">
      <CardSkeleton count={2}>
        <div className="flex items-center gap-4 p-6">
          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardSkeleton>
    </div>

    {/* Snapshot area */}
    <Skeleton className="h-64 w-full rounded-lg" />

    <DangerZoneSkeleton />
  </div>
);
