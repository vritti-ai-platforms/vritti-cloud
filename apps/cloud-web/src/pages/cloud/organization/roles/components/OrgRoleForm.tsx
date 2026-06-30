import { useOrgPermissions } from '@hooks/cloud/org-roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { AppWindow, Shield } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { countUnlocks, SnapshotMatrix } from '@/components/snapshot-matrix';
import type { CreateOrgRoleData, CreateOrgRoleFormData, OrgRole } from '@/schemas/cloud/org-roles';
import { createOrgRoleSchema } from '@/schemas/cloud/org-roles';

interface OrgRoleFormProps {
  orgId: string;
  role?: OrgRole;
  onSubmit: (data: CreateOrgRoleData) => void;
  isPending: boolean;
}

// Form for creating or editing an org role. The permission picker is the shared snapshot matrix, registered as the
// `features` form field — every app/feature/permission shows (locked ones with their upsell) and the role grants a subset.
export const OrgRoleForm: React.FC<OrgRoleFormProps> = ({ orgId, role, onSubmit, isPending }) => {
  const isEditing = !!role;

  const form = useForm<CreateOrgRoleFormData>({
    resolver: zodResolver(createOrgRoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      scope: role?.scope ?? 'GLOBAL',
      features: role?.features ?? {},
    },
  });

  const { data: matrix, isLoading: permsLoading } = useOrgPermissions(orgId);
  const apps = matrix?.apps ?? [];

  const counts = countUnlocks(form.watch('features'));

  return (
    <div className="flex flex-col gap-6">
      <Form form={form} onSubmit={onSubmit}>
        {/* Role details */}
        <TextField name="name" label="Role Name" placeholder="e.g. Regional Manager" />
        <TextField name="description" label="Description" placeholder="Optional description" />
        <Select
          name="scope"
          label="Scope"
          placeholder="Select scope"
          options={[
            { value: 'GLOBAL', label: 'Global (all business units)' },
            { value: 'SUBTREE', label: 'Subtree (BU and descendants)' },
            { value: 'SINGLE_BU', label: 'Single Business Unit' },
          ]}
        />

        {/* Permission picker */}
        <div className="pt-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Permissions</h3>
              <p className="text-xs text-muted-foreground">
                {counts.permissions} permission(s) across {counts.features} feature(s)
              </p>
            </div>
          </div>

          {permsLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5 text-primary" />
            </div>
          )}

          {!permsLoading && apps.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border py-8 text-center">
              <AppWindow className="mb-2 size-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No features available for this organization.</p>
            </div>
          )}

          {!permsLoading && apps.length > 0 && <SnapshotMatrix name="features" apps={apps} />}

          {!permsLoading && counts.permissions > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              <span>
                {counts.permissions} permission(s) across {counts.features} feature(s)
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isPending} loadingText={isEditing ? 'Saving...' : 'Creating...'}>
            {isEditing ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </Form>
    </div>
  );
};
