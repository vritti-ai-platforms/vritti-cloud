import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { DangerZoneSkeleton } from '@vritti/quantum-ui/DangerZone';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { PermissionMatrixSkeleton } from './forms/permission-matrix/PermissionMatrixSkeleton';

// Mirrors the real page layout: header → cards → permission matrix → danger zone.
export const RoleTemplateViewPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton />

    {/* Role info — 4 columns */}
    <div className="grid grid-cols-4 gap-4">
      <CardSkeleton count={4}>
        <div className="flex items-center gap-4 p-6">
          <Skeleton className="size-12 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      </CardSkeleton>
    </div>

    {/* Permission matrix — toolbar + collapsibles */}
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <PermissionMatrixSkeleton />
    </div>

    <DangerZoneSkeleton />
  </div>
);
