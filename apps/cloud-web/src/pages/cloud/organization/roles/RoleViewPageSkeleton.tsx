import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const RoleViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions />

    {/* Stat cards — two columns */}
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>

    {/* Permission matrix */}
    <Skeleton className="h-96 rounded-xl" />
  </div>
);
