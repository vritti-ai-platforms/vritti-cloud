import { usePermissions, useUpdateRole } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Form } from '@vritti/quantum-ui/Form';
import { Layers } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { SnapshotMatrix } from '@/components/snapshot-matrix';
import type { FeatureUnlocks } from '@/schemas/cloud/bu-matrix';
import type { Role } from '@/schemas/cloud/roles';

interface RolePermissionFormProps {
  orgId: string;
  role: Role;
}

// Inline permission editor for a role — the shared snapshot matrix bound to the role's `features`, saved via update.
export const RolePermissionForm: React.FC<RolePermissionFormProps> = ({ orgId, role }) => {
  const { data: matrix, isLoading } = usePermissions(orgId);
  const apps = matrix?.apps ?? [];
  const updateMutation = useUpdateRole();

  const form = useForm<{ features: FeatureUnlocks }>({ defaultValues: { features: role.features } });

  const onSubmit = (data: { features: FeatureUnlocks }) =>
    updateMutation.mutate(
      { orgId, roleId: role.id, data: { features: data.features } },
      { onSuccess: () => form.reset(data) },
    );

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex min-h-120 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Switch a feature on per platform to grant this role access, then check the actions it can perform. Web and
            Mobile are tracked separately.
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={!form.formState.isDirty}
            isLoading={updateMutation.isPending}
            loadingText="Saving..."
          >
            Save Permissions
          </Button>
        </div>

        {isLoading ? (
          <PermissionMatrixSkeleton />
        ) : apps.length === 0 ? (
          <Empty
            className="min-h-100"
            icon={<Layers />}
            title="No features available"
            description="Features will appear here once your plan is configured."
          />
        ) : (
          <SnapshotMatrix name="features" apps={apps} />
        )}
      </div>
    </Form>
  );
};
