import {
  usePlanAvailableApps,
  usePlanUnlocked,
  useSetPlanUnlocked,
} from '@hooks/admin/versions/businesses/plans/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Layers, Lock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppCard,
  grantKey,
  grantsToKeySet,
  keySetToGrants,
  PermissionMatrixSkeleton,
} from '@/components/permission-matrix';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { MatrixFeature, MatrixGrant, Platform } from '@/schemas/admin/permission-matrix';

export const FeaturesTab: React.FC = () => {
  const { versionId, businessId, planId } = useVersionContext();

  const { data: apps = [], isLoading: appsLoading } = usePlanAvailableApps(versionId, businessId, planId);
  const { data: unlocked, isLoading: unlockedLoading } = usePlanUnlocked(versionId, businessId, planId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const initialRef = useRef<string>('');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const seededRef = useRef(false);

  const saveMutation = useSetPlanUnlocked(versionId, businessId, planId);

  // Seed once from the plan's current grants; expand every app by default
  useEffect(() => {
    if (!unlocked || apps.length === 0 || seededRef.current) return;
    const keys = grantsToKeySet(unlocked.grants);
    setSelected(keys);
    initialRef.current = [...keys].sort().join('|');
    setExpandedApps(new Set(apps.map((a) => a.id)));
    seededRef.current = true;
  }, [unlocked, apps]);

  // Toggle one permission on one platform
  const togglePermission = useCallback((featurePermissionId: string, platform: Platform) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = grantKey(featurePermissionId, platform);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  // Toggle a whole feature for one platform (the feature's master checkbox)
  const toggleFeatureColumn = useCallback((feature: MatrixFeature, platform: Platform) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const keys = feature.permissions.map((p) => grantKey(p.featurePermissionId, platform));
      const allOn = keys.every((k) => next.has(k));
      for (const k of keys) allOn ? next.delete(k) : next.add(k);
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

  const isDirty = useMemo(() => [...selected].sort().join('|') !== initialRef.current, [selected]);
  const grants: MatrixGrant[] = useMemo(() => keySetToGrants(selected), [selected]);

  if (appsLoading || unlockedLoading) {
    return <PermissionMatrixSkeleton />;
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
          Check the permissions this plan unlocks per platform. Unchecked permissions stay visible but locked for
          upsell.
        </p>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate(grants)}
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
          <AppCard
            key={app.id}
            app={app}
            selected={selected}
            expanded={expandedApps.has(app.id)}
            onToggleExpanded={() => toggleApp(app.id)}
            onTogglePermission={togglePermission}
            onToggleFeatureColumn={toggleFeatureColumn}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>{selected.size} unlock(s) selected</span>
      </div>
    </div>
  );
};
