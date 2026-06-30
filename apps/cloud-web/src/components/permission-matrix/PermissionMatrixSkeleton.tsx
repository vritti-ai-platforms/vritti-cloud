import { Skeleton } from '@vritti/quantum-ui/Skeleton';

// Loading placeholder mirroring the matrix editor: description + Save bar, a stack of collapsed
// app cards (icon + name/count header), and the footer summary line.
export const PermissionMatrixSkeleton: React.FC = () => (
  <div className="flex min-h-120 flex-col gap-4">
    {/* Description paragraph + Save button */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
        <Skeleton className="h-3.5 w-full max-w-2xl" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
    </div>

    {/* Collapsed app cards */}
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 bg-muted/50 px-4 py-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* Footer summary */}
    <div className="flex items-center gap-2 pt-1">
      <Skeleton className="size-3.5 rounded" />
      <Skeleton className="h-3 w-44" />
    </div>
  </div>
);
