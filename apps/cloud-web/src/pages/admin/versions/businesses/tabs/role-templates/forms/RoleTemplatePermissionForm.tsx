import {
  useRoleTemplatePermissions,
  useSetRoleTemplatePermissions,
} from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { Platform, RoleTemplateFeature, RoleTemplateGrant } from '@/schemas/admin/role-templates';
import { AppCard } from './permission-matrix/AppCard';
import { PermissionMatrixSkeleton } from './permission-matrix/PermissionMatrixSkeleton';
import { grantKey, grantsToKeySet, keySetToGrants } from './permission-matrix/utils';

interface RoleTemplatePermissionFormProps {
  roleId: string;
}

interface PermissionFormValues {
  grants: RoleTemplateGrant[];
}

export const RoleTemplatePermissionForm: React.FC<RoleTemplatePermissionFormProps> = ({ roleId }) => {
  const { versionId, businessId } = useVersionContext();
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  // One call: the role's apps (each with its features) + the full grant set
  const { data, isLoading } = useRoleTemplatePermissions(versionId, businessId, roleId);
  const apps = data?.apps ?? [];

  const form = useForm<PermissionFormValues>({ defaultValues: { grants: [] } });
  const saveMutation = useSetRoleTemplatePermissions();

  // Seed the form once from the grant set; expand every app by default so the grids are visible
  const seededRef = useRef(false);
  useEffect(() => {
    if (!data || seededRef.current) return;
    form.reset({ grants: data.grants });
    setExpandedApps(new Set(data.apps.map((a) => a.id)));
    seededRef.current = true;
  }, [data, form]);

  const grants = form.watch('grants');
  const selected = useMemo(() => grantsToKeySet(grants), [grants]);
  const isDirty = form.formState.isDirty;

  // Apply a new selection set back to the RHF grants field
  const commit = useCallback(
    (next: Set<string>) => form.setValue('grants', keySetToGrants(next), { shouldDirty: true }),
    [form],
  );

  // Toggle one permission on one platform
  const togglePermission = useCallback(
    (featurePermissionId: string, platform: Platform) => {
      const next = new Set(selected);
      const key = grantKey(featurePermissionId, platform);
      next.has(key) ? next.delete(key) : next.add(key);
      commit(next);
    },
    [selected, commit],
  );

  // Toggle every permission of a feature for one platform (the feature's master checkbox)
  const toggleFeatureColumn = useCallback(
    (feature: RoleTemplateFeature, platform: Platform) => {
      const next = new Set(selected);
      const keys = feature.permissions.map((p) => grantKey(p.featurePermissionId, platform));
      const allOn = keys.every((k) => next.has(k));
      for (const k of keys) allOn ? next.delete(k) : next.add(k);
      commit(next);
    },
    [selected, commit],
  );

  const toggleApp = useCallback((appId: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      next.has(appId) ? next.delete(appId) : next.add(appId);
      return next;
    });
  }, []);

  return (
    <Form
      form={form}
      mutation={saveMutation}
      resetOnSuccess={false}
      transformSubmit={(values: PermissionFormValues) => ({
        versionId,
        businessId,
        roleId,
        data: { grants: values.grants },
      })}
    >
      <div className="flex min-h-100 flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Grant permissions per app and feature. Web and Mobile are tracked separately.
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
              <p className="text-sm font-medium text-foreground">No apps available</p>
              <p className="mt-1 text-xs text-muted-foreground">Assign apps via Edit to start assigning permissions.</p>
            </CardContent>
          </Card>
        ) : (
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
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          <span>{selected.size} grant(s) selected</span>
        </div>
      </div>
    </Form>
  );
};
