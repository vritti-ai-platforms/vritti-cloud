import { useOrgApps } from '@hooks/cloud/org-apps';
import { useUpdateBuApps } from '@hooks/cloud/org-business-units';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Switch } from '@vritti/quantum-ui/Switch';
import { AppWindow, Layers } from 'lucide-react';

interface AppsTabProps {
  orgId: string;
  buId: string;
  appCodes: string[];
}

// Apps tab showing assignable apps for a business unit
export const AppsTab = ({ orgId, buId, appCodes }: AppsTabProps) => {
  const { data: response, isLoading } = useOrgApps(orgId);
  const updateMutation = useUpdateBuApps();

  // Only show apps that are included in the plan or already enabled
  const availableApps = (response?.result ?? []).filter(
    (a) => a.status === 'included' || a.status === 'enabled',
  );

  const assignedSet = new Set(appCodes);

  // Toggles an app on or off for this BU
  function handleToggle(appCode: string) {
    const next = new Set(assignedSet);
    if (next.has(appCode)) {
      next.delete(appCode);
    } else {
      next.add(appCode);
    }
    updateMutation.mutate({ orgId, buId, appCodes: [...next] });
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <p className="text-sm text-muted-foreground">
        {assignedSet.size} app{assignedSet.size !== 1 ? 's' : ''} assigned
      </p>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skeleton-${i.toString()}`} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && availableApps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No applications available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Enable applications for your organization first.
          </p>
        </div>
      )}

      {!isLoading && availableApps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableApps.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 shrink-0">
                    <AppWindow className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{app.name}</p>
                    {app.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{app.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.features.length} feature{app.features.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={assignedSet.has(app.code)}
                  onCheckedChange={() => handleToggle(app.code)}
                  disabled={updateMutation.isPending}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
