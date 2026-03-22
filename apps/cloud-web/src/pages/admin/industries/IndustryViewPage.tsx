import { useIndustryApps, useRemoveIndustryApp, useUpdateIndustryApp } from '@hooks/admin/industry-apps';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useConfirm, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { AppWindow, Plus, Star, StarOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IndustryApp } from '@/schemas/admin/industry-apps';
import { AssignIndustryAppForm } from './forms/AssignIndustryAppForm';

export const IndustryViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();

  // For now we just show the apps tab — industry detail comes from the list
  if (!id) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Industry Details"
        description="Manage apps assigned to this industry"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/industries')}>
            Back to Industries
          </Button>
        }
      />

      <Tabs
        defaultValue="apps"
        tabs={[{ value: 'apps', label: 'Apps', content: <IndustryAppsTab industryId={id} /> }]}
      />
    </div>
  );
};

// Apps tab — list assigned apps with remove and toggle recommended
const IndustryAppsTab = ({ industryId }: { industryId: string }) => {
  const { data: apps = [], isLoading } = useIndustryApps(industryId);
  const confirm = useConfirm();
  const removeMutation = useRemoveIndustryApp();
  const updateMutation = useUpdateIndustryApp();

  async function handleRemove(app: IndustryApp) {
    const confirmed = await confirm({
      title: `Remove ${app.appName}?`,
      description: 'This app will be unassigned from the industry.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ industryId, appId: app.appId });
  }

  // Toggle the recommended flag
  function toggleRecommended(app: IndustryApp) {
    updateMutation.mutate({
      industryId,
      appId: app.appId,
      data: { isRecommended: !app.isRecommended },
    });
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{apps.length} app(s) assigned</p>
        <Dialog
          title="Assign App"
          description="Select an app to assign to this industry."
          anchor={(open) => (
            <Button size="sm" startAdornment={<Plus className="size-4" />} onClick={open}>
              Assign App
            </Button>
          )}
          content={(close) => (
            <AssignIndustryAppForm industryId={industryId} onSuccess={close} onCancel={close} />
          )}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-5 text-primary" />
        </div>
      )}

      {!isLoading && apps.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AppWindow className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No apps assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Assign apps to recommend them for this industry.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && apps.length > 0 && (
        <div className="border rounded-lg divide-y">
          {apps.map((app) => (
            <div key={app.appId} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.appName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{app.appCode}</p>
                </div>
                {app.isRecommended && (
                  <Badge className="bg-warning/15 text-warning border-warning/30">Recommended</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => toggleRecommended(app)}
                  disabled={updateMutation.isPending}
                  aria-label={app.isRecommended ? 'Remove recommendation' : 'Mark as recommended'}
                >
                  {app.isRecommended ? (
                    <StarOff className="size-4 text-warning" />
                  ) : (
                    <Star className="size-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(app)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
