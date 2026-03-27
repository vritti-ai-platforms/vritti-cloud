import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const RegionViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />

    {/* Stat cards — 3 columns */}
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

    {/* Cloud Providers card */}
    <div className="bg-card text-card-foreground rounded-xl border py-6">
      <div className="flex flex-col gap-6">
        <div className="px-6 flex flex-col gap-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="px-6 flex flex-col gap-2 min-h-48">
          <Skeleton className="h-[69px] w-full rounded-xl" />
          <Skeleton className="h-[69px] w-full rounded-xl" />
          <Skeleton className="h-[69px] w-full rounded-xl" />
        </div>
      </div>
    </div>

    <DangerZoneSkeleton />
  </div>
);
