import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const OrganizationViewPageSkeleton = () => (
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

    {/* Plan card */}
    <div className="bg-card text-card-foreground rounded-xl border py-6">
      <div className="flex flex-col gap-6">
        <div className="px-6">
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="px-6 flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>

    {/* Deployment card */}
    <div className="bg-card text-card-foreground rounded-xl border py-6">
      <div className="flex flex-col gap-6">
        <div className="px-6">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="px-6 flex flex-col gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>

    {/* Members table skeleton */}
    <Skeleton className="h-[400px] w-full rounded-lg" />
  </div>
);
