import { Skeleton } from '@vritti/quantum-ui/Skeleton';

// Loading placeholder for the permission matrix — a stack of app-card headers
export const PermissionMatrixSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
    ))}
  </div>
);
