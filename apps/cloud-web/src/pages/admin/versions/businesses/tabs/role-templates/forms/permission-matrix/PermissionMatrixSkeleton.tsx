import { Skeleton } from '@vritti/quantum-ui/Skeleton';

// Loading placeholder for the permission matrix — skeleton collapsible rows (owned by the permissions query)
export const PermissionMatrixSkeleton: React.FC = () => (
  <div className="border rounded-lg divide-y">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);
