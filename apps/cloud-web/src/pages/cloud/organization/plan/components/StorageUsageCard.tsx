import { useOrgStorage } from '@hooks/cloud/organizations/useOrgStorage';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Progress } from '@vritti/quantum-ui/Progress';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { HardDrive } from 'lucide-react';

// Decimal units, matching how storage providers report and bill (IEC: MB = 10^6, MiB = 2^20). Using 1024 here while
// labelling it "MB" is the common mistake, and it makes this page disagree with the provider's dashboard by 4.9%.
const formatBytes = (bytes: number): string => {
  if (bytes >= 1000 ** 3) return `${+(bytes / 1000 ** 3).toFixed(1)} GB`;
  if (bytes >= 1000 ** 2) return `${+(bytes / 1000 ** 2).toFixed(1)} MB`;
  if (bytes >= 1000) return `${+(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

// Live storage usage against the plan allowance. The figure is read from the storage provider on request, so it is
// authoritative rather than a counter we maintain — but it lags real writes by a few minutes.
export const StorageUsageCard = ({ orgId }: { orgId: string }) => {
  const { data, isLoading } = useOrgStorage(orgId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.provisioned) return null;

  const { usedBytes, limitBytes } = data;
  // A limit the server could not resolve is shown as usage without a bar, rather than as an invented denominator
  const percentage = limitBytes ? Math.min(Math.round((usedBytes / limitBytes) * 100), 100) : null;
  const exceeded = limitBytes !== null && usedBytes >= limitBytes;
  const nearLimit = percentage !== null && percentage >= 80 && !exceeded;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <HardDrive className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Storage</p>
            <p className="text-lg font-semibold">
              {formatBytes(usedBytes)}
              {limitBytes !== null && (
                <span className="text-muted-foreground font-normal"> of {formatBytes(limitBytes)}</span>
              )}
            </p>
          </div>
          {percentage !== null && (
            <p
              className={
                exceeded
                  ? 'text-destructive font-semibold'
                  : nearLimit
                    ? 'text-warning font-semibold'
                    : 'text-muted-foreground'
              }
            >
              {percentage}%
            </p>
          )}
        </div>

        {percentage !== null && <Progress value={percentage} />}

        {exceeded && (
          <p className="text-sm text-destructive">
            Your plan's storage allowance is full. Uploads are paused until files are removed or the plan is upgraded.
          </p>
        )}
        {nearLimit && <p className="text-sm text-warning">You're approaching your plan's storage allowance.</p>}
      </CardContent>
    </Card>
  );
};
