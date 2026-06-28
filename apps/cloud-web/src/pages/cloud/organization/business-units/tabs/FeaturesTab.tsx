import { useBuPermissionMatrix, useSetBuPermissions } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Layers, Lock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { AppCard, buildState, cellKey, PermissionMatrixSkeleton } from '@/components/permission-matrix';
import type { MatrixMembership, Platform } from '@/schemas/admin/permission-matrix';

interface FeaturesTabProps {
  orgId: string;
  buId: string;
}

// Features tab — the BU's permission lock editor. The plan is the ceiling; toggling here restricts within it.
export const FeaturesTab: React.FC<FeaturesTabProps> = ({ orgId, buId }) => {
  const { data, isLoading } = useBuPermissionMatrix(orgId, buId);
  const apps = data?.apps ?? [];
  const saveMutation = useSetBuPermissions(orgId, buId);

  const form = useForm<{ memberships: MatrixMembership[] }>({ defaultValues: { memberships: [] } });
  const { append, remove, update } = useFieldArray({ control: form.control, name: 'memberships' });

  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const seededRef = useRef(false);

  // Seed once from the nested memberships; expand every app by default
  useEffect(() => {
    if (!data || apps.length === 0 || seededRef.current) return;
    form.reset({ memberships: data.apps.flatMap((a) => a.memberships) });
    setExpandedApps(new Set(apps.map((a) => a.id)));
    seededRef.current = true;
  }, [data, apps, form]);

  const memberships = form.watch('memberships');
  const state = useMemo(() => buildState(memberships), [memberships]);
  const indexByKey = useMemo(() => {
    const m = new Map<string, number>();
    memberships.forEach((mm, i) => {
      m.set(cellKey(mm.featureId, mm.platform), i);
    });
    return m;
  }, [memberships]);
  const isDirty = form.formState.isDirty;

  // The switch — include/remove a feature on a platform (removing drops its nested unlocks)
  const toggleMembership = useCallback(
    (featureId: string, platform: Platform) => {
      const i = indexByKey.get(cellKey(featureId, platform));
      if (i !== undefined) remove(i);
      else append({ featureId, platform, permissions: [] }, { shouldFocus: false });
    },
    [indexByKey, append, remove],
  );

  // The checkbox — unlock/lock a permission inside its membership element
  const togglePermission = useCallback(
    (featureId: string, featurePermissionId: string, platform: Platform) => {
      const i = indexByKey.get(cellKey(featureId, platform));
      if (i === undefined) return;
      const m = memberships[i];
      const has = m.permissions.includes(featurePermissionId);
      update(i, {
        ...m,
        permissions: has
          ? m.permissions.filter((p) => p !== featurePermissionId)
          : [...m.permissions, featurePermissionId],
      });
    },
    [indexByKey, memberships, update],
  );

  // featureId → its permission ids (from the catalog), for the "All" tri-state
  const permIdsByFeatureId = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const app of apps) {
      for (const f of app.features)
        m.set(
          f.id,
          f.permissions.map((p) => p.featurePermissionId),
        );
    }
    return m;
  }, [apps]);

  // The "All" master checkbox — unlock every permission of the feature on a platform, or clear them
  const toggleAll = useCallback(
    (featureId: string, platform: Platform) => {
      const i = indexByKey.get(cellKey(featureId, platform));
      if (i === undefined) return;
      const all = permIdsByFeatureId.get(featureId) ?? [];
      const m = memberships[i];
      const allOn = all.length > 0 && all.every((id) => m.permissions.includes(id));
      update(i, { ...m, permissions: allOn ? [] : [...all] });
    },
    [indexByKey, permIdsByFeatureId, memberships, update],
  );

  const toggleApp = useCallback((id: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const grantCount = useMemo(() => memberships.reduce((sum, m) => sum + m.permissions.length, 0), [memberships]);
  const save = () => saveMutation.mutate({ memberships }, { onSuccess: () => form.reset({ memberships }) });

  if (isLoading) {
    return <PermissionMatrixSkeleton />;
  }

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No features available</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your plan unlocks no features for this business unit to restrict.
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
          Your plan is the ceiling — switch a feature off for this business unit, or uncheck the actions it should not
          allow. A switched-on feature with no actions is included but view-only.
        </p>
        <Button size="sm" onClick={save} disabled={!isDirty} isLoading={saveMutation.isPending} loadingText="Saving...">
          Save Unlocks
        </Button>
      </div>

      {/* App cards (layer 1) → feature unlock grids (layer 2) */}
      <div className="flex flex-col gap-3">
        {apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            state={state}
            expanded={expandedApps.has(app.id)}
            onToggleExpanded={() => toggleApp(app.id)}
            onToggleMembership={toggleMembership}
            onTogglePermission={togglePermission}
            onToggleAll={toggleAll}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        <span>
          {memberships.length} feature(s) · {grantCount} unlock(s)
        </span>
      </div>
    </div>
  );
};
