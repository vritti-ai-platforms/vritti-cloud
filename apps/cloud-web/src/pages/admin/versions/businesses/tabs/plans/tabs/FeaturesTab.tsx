import {
  usePlanAvailableApps,
  usePlanUnlocked,
  useSetPlanUnlocked,
} from '@hooks/admin/versions/businesses/plans/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Layers, Lock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVersionContext } from '@/context/VersionScopeContext';
import { PlanAppCard } from './features/PlanAppCard';

// Serialize a Set of ids into a stable string for dirty comparison
function serializeSelected(ids: Set<string>): string {
  return [...ids].sort().join('|');
}

export const FeaturesTab: React.FC = () => {
  const { versionId, businessId, planId } = useVersionContext();

  const { data: apps = [], isLoading: appsLoading } = usePlanAvailableApps(versionId, businessId, planId);
  const { data: unlocked, isLoading: unlockedLoading } = usePlanUnlocked(versionId, businessId, planId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const initialRef = useRef<string>('');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const seededRef = useRef(false);

  const saveMutation = useSetPlanUnlocked(versionId, businessId, planId);

  // Seed from the plan's currently unlocked ids; expand every app by default so the grids are visible
  useEffect(() => {
    if (!unlocked || apps.length === 0 || seededRef.current) return;
    const ids = new Set<string>(unlocked.featurePermissionIds);
    setSelected(ids);
    initialRef.current = serializeSelected(ids);
    setExpandedApps(new Set(apps.map((a) => a.id)));
    seededRef.current = true;
  }, [unlocked, apps]);

  // Toggle a single permission
  const togglePermission = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Toggle a whole feature (its permission ids) — clear when fully on, otherwise select all
  const toggleFeature = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = ids.length > 0 && ids.every((id) => next.has(id));
      for (const id of ids) allOn ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleApp = useCallback((id: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isDirty = serializeSelected(selected) !== initialRef.current;

  if (appsLoading || unlockedLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">
          <Skeleton className="h-9 w-36" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No features available</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Assign features to this business’s apps to unlock their permissions here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-100 flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Check the permissions this plan unlocks. Unchecked permissions stay visible but locked for upsell.
        </p>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate([...selected])}
          disabled={!isDirty}
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
        >
          Save Unlocks
        </Button>
      </div>

      {/* App cards (layer 1) → feature unlock grids (layer 2) */}
      <div className="flex flex-col gap-3">
        {apps.map((app) => (
          <PlanAppCard
            key={app.id}
            app={app}
            selected={selected}
            expanded={expandedApps.has(app.id)}
            onToggleExpanded={() => toggleApp(app.id)}
            onTogglePermission={togglePermission}
            onToggleFeature={toggleFeature}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>{selected.size} permission(s) unlocked</span>
      </div>
    </div>
  );
};
