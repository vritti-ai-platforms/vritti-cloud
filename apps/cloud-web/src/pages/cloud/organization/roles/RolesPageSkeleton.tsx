import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const RolesPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions />

    <div className="flex flex-col gap-10">
      {[0, 1, 2].map((section) => (
        <div key={`section-${section}`} className="flex flex-col gap-4">
          {/* Scope header — icon tile, title, description */}
          <div className="flex items-center gap-3 border-b pb-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          {/* Divided row list */}
          <div className="divide-y overflow-hidden rounded-lg border bg-card">
            {[0, 1, 2].map((row) => (
              <div key={`row-${row}`} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
