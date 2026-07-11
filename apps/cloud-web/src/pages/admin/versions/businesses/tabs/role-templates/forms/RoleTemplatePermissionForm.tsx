import { useRoleTemplateGrants, useSetRoleTemplatePermissions } from '@hooks/admin/versions/businesses/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers } from 'lucide-react';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { useVersionContext } from '@/context/VersionScopeContext';
import { SCOPE_TYPE_LABELS, type ScopeType, type SiteType } from '@/schemas/admin/features';
import type { RoleTemplateFeature, RoleTemplateGrant } from '@/schemas/admin/role-templates';
import { RoleGrantMatrix } from '../components/RoleGrantMatrix';

interface PermissionFormValues {
  grants: RoleTemplateGrant[];
}

interface RoleTemplatePermissionFormProps {
  scope: ScopeType;
  siteType?: SiteType;
}

// Suspense boundary — the editor below mounts only once the grant matrix has loaded
export const RoleTemplatePermissionForm: React.FC<RoleTemplatePermissionFormProps> = ({ scope, siteType }) => (
  <Suspense fallback={<PermissionMatrixSkeleton />}>
    <RoleGrantsEditor key={`${scope}:${siteType ?? ''}`} scope={scope} siteType={siteType} />
  </Suspense>
);

const RoleGrantsEditor: React.FC<{ scope: ScopeType; siteType?: SiteType }> = ({ scope, siteType }) => {
  const { versionId, businessId, roleTemplateId } = useVersionContext();

  const { data } = useRoleTemplateGrants(versionId, businessId, roleTemplateId);
  const grantable = (f: RoleTemplateFeature) =>
    f.scope === scope && (scope !== 'SITE' || !siteType || (f.applicableSiteTypes ?? []).includes(siteType));
  const apps = data.apps
    .map((app) => ({ ...app, features: app.features.filter(grantable) }))
    .filter((app) => app.features.length > 0);
  const featureIds = new Set(apps.flatMap((a) => a.features.map((f) => f.id)));
  const saveMutation = useSetRoleTemplatePermissions(versionId, businessId, roleTemplateId);

  // Data is guaranteed present (suspense), so seed react-hook-form directly — no reset/seededRef dance
  const form = useForm<PermissionFormValues>({
    defaultValues: { grants: data.apps.flatMap((a) => a.grants).filter((g) => featureIds.has(g.featureId)) },
  });

  if (apps.length === 0) {
    return (
      <Empty
        className="min-h-120"
        icon={<Layers />}
        title="No features available"
        description={`Add ${SCOPE_TYPE_LABELS[scope]}-scoped features to this business’s apps to start assigning permissions.`}
      />
    );
  }

  return (
    <Form form={form} mutation={saveMutation} resetOnSuccess={false}>
      <div className="flex min-h-120 flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Switch a feature on per platform to add it to the role, then grant its actions. Web and Mobile are tracked
            separately.
          </p>
          <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
            Save Permissions
          </Button>
        </div>

        <RoleGrantMatrix name="grants" apps={apps} />
      </div>
    </Form>
  );
};
