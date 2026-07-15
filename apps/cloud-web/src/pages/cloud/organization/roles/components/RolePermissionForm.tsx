import { usePermissions, useRoleTemplates, useUpdateRole } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Form } from '@vritti/quantum-ui/Form';
import type { FeatureUnlocks } from '@vritti/quantum-ui/types/catalog-resolver';
import { Layers } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { SnapshotMatrix } from '@/components/snapshot-matrix';
import { composeGrants, diffGrants } from '@/schemas/cloud/role-grants';
import type { Role } from '@/schemas/cloud/roles';

interface RolePermissionFormProps {
  orgId: string;
  role: Role;
  readOnly?: boolean;
}

// Inline permission editor for a role — shared snapshot matrix over the role's EFFECTIVE grants; on save the selection is diffed against the template so only deltas persist.
export const RolePermissionForm: React.FC<RolePermissionFormProps> = ({ orgId, role, readOnly }) => {
  const { data: matrix, isLoading } = usePermissions(orgId);
  // The template's grants are needed both to compose the initial selection and to diff on save
  const { data: templates = [], isLoading: templatesLoading } = useRoleTemplates(orgId);
  const template = templates.find((t) => t.code === role.code);
  const allApps = matrix?.apps ?? [];

  // The endpoint now returns features across every scope; a scoped role only picks features at its own scope
  // (a SITE role additionally narrows to features applicable to its site type).
  const roleScope = template?.scope;
  const apps = roleScope
    ? allApps
        .map((app) => ({
          ...app,
          features: app.features.filter(
            (f) =>
              f.scope === roleScope &&
              (roleScope !== 'SITE' ||
                !template?.siteType ||
                (f.applicableSiteTypes ?? []).includes(template.siteType)),
          ),
        }))
        .filter((app) => app.features.length > 0)
    : allApps;

  const base = template?.features;
  const loading = isLoading || templatesLoading;

  if (loading) {
    return <PermissionMatrixSkeleton />;
  }

  return <RolePermissionFormInner orgId={orgId} role={role} apps={apps} base={base} readOnly={readOnly} />;
};

// Split so the form's defaultValues are computed once, after the base template has loaded
const RolePermissionFormInner: React.FC<{
  orgId: string;
  role: Role;
  apps: NonNullable<ReturnType<typeof usePermissions>['data']>['apps'];
  base: FeatureUnlocks | undefined;
  readOnly?: boolean;
}> = ({ orgId, role, apps, base, readOnly }) => {
  const form = useForm<{ features: FeatureUnlocks }>({
    defaultValues: { features: composeGrants(base ?? {}, role.features, role.revoked) },
  });
  // Re-baseline the form to the saved selection so dirty tracking restarts from the persisted state
  const updateMutation = useUpdateRole({ onSuccess: () => form.reset(form.getValues()) });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      // Only the deltas vs the template persist; a missing template degrades to saving the selection as-is
      transformSubmit={(data: { features: FeatureUnlocks }) => ({
        orgId,
        roleId: role.id,
        data: base ? diffGrants(base, data.features) : { features: data.features },
      })}
    >
      <div className="flex min-h-120 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Switch a feature on per platform to grant this role access, then check the actions it can perform. Web and
            Mobile are tracked separately. Locked items can still be granted — they activate when your plan unlocks
            them.
          </p>
          {!readOnly && (
            <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
              Save Permissions
            </Button>
          )}
        </div>

        {apps.length === 0 ? (
          <Empty
            className="min-h-100"
            icon={<Layers />}
            title="No features available"
            description="Features will appear here once your plan is configured."
          />
        ) : (
          <SnapshotMatrix name="features" apps={apps} allowLockedGrants readOnly={readOnly} />
        )}
      </div>
    </Form>
  );
};
