import {
  useRoleTemplatePermissions,
  useSetRoleTemplatePermissions,
} from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { Layers, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { AppCard, buildState, cellKey, PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { Platform, RoleTemplateMembership } from '@/schemas/admin/role-templates';

interface PermissionFormValues {
  memberships: RoleTemplateMembership[];
}

export const RoleTemplatePermissionForm: React.FC = () => {
  const { versionId, businessId } = useVersionContext();
  const { id: roleId = '' } = useSlugParams('roleTemplateSlug');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  // One call: the role's apps (catalog) each with the role's current memberships nested under it
  const { data, isLoading } = useRoleTemplatePermissions(versionId, businessId, roleId);
  const apps = data?.apps ?? [];

  const form = useForm<PermissionFormValues>({ defaultValues: { memberships: [] } });
  const { append, remove, update } = useFieldArray({ control: form.control, name: 'memberships' });
  const saveMutation = useSetRoleTemplatePermissions();

  // Seed the form once from the nested memberships; app cards start collapsed
  const seededRef = useRef(false);
  useEffect(() => {
    if (!data || seededRef.current) return;
    form.reset({ memberships: data.apps.flatMap((a) => a.memberships) });
    seededRef.current = true;
  }, [data, form]);

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

  // The switch — add a membership element (view-only) or remove it (drops its nested permissions)
  const toggleMembership = useCallback(
    (featureId: string, platform: Platform) => {
      const i = indexByKey.get(cellKey(featureId, platform));
      if (i !== undefined) remove(i);
      else append({ featureId, platform, permissions: [] }, { shouldFocus: false });
    },
    [indexByKey, append, remove],
  );

  // The checkbox — add/remove a permission id inside its membership element
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

  // The "All" master checkbox — grant every permission of the feature on a platform, or clear them
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

  const toggleApp = useCallback((appId: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      next.has(appId) ? next.delete(appId) : next.add(appId);
      return next;
    });
  }, []);

  const grantCount = useMemo(() => memberships.reduce((sum, m) => sum + m.permissions.length, 0), [memberships]);

  return (
    <Form
      form={form}
      mutation={saveMutation}
      resetOnSuccess={false}
      transformSubmit={(values: PermissionFormValues) => ({
        versionId,
        businessId,
        roleId,
        data: { memberships: values.memberships },
      })}
    >
      <div className="flex min-h-100 flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Switch a feature on per platform to add it to the role, then grant its actions. Web and Mobile are tracked
            separately.
          </p>
          <Button type="submit" size="sm" disabled={!isDirty} loadingText="Saving...">
            Save Permissions
          </Button>
        </div>

        {/* App cards (layer 1) → feature grids (layer 2) */}
        {isLoading ? (
          <PermissionMatrixSkeleton />
        ) : apps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No features available</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add features to this business’s apps to start assigning permissions.
              </p>
            </CardContent>
          </Card>
        ) : (
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
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          <span>
            {memberships.length} feature(s) · {grantCount} grant(s)
          </span>
        </div>
      </div>
    </Form>
  );
};
