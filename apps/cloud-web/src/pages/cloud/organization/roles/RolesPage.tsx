import { useDeleteRole, useRoles, useRoleTemplates } from '@hooks/cloud/roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Copy, Plus, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDefaultRole, type Role } from '@/schemas/cloud/roles';
import { AddRoleForm } from './components/AddRoleForm';
import { RoleCard } from './components/RoleCard';
import { TemplatePickerDialog } from './components/TemplatePickerDialog';

export const RolesPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();

  const { data: roles = [], isLoading } = useRoles(orgId);
  const { data: templates = [] } = useRoleTemplates(orgId);
  const templateByCode = new Map(templates.map((t) => [t.code, t]));
  const confirm = useConfirm();
  const addDialog = useDialog();
  const templateDialog = useDialog();
  const deleteMutation = useDeleteRole();

  // Opens the newly created role's view page (slug URL) to set its permissions
  function handleCreated(role: Role) {
    addDialog.close();
    navigate(buildSlug(role.name, role.id));
  }

  // Confirms and deletes a role
  async function handleDelete(role: Role) {
    const confirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: `${role.name} and all its permission assignments will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ orgId, roleId: role.id });
  }

  const systemRoles = roles.filter(isDefaultRole);
  const customRoles = roles.filter((r) => !isDefaultRole(r));

  const actions = (
    <div className="flex gap-2">
      <Button startAdornment={<Copy className="size-4" />} variant="outline" size="sm" onClick={templateDialog.open}>
        Add Default Roles
      </Button>
      <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
        Add Role
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions within your organization"
        actions={actions}
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skeleton-${i.toString()}`} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && roles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="mb-3 size-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No roles defined</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first role to manage access control.</p>
          <div className="mt-4">{actions}</div>
        </div>
      )}

      {systemRoles.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Default roles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {systemRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                baseFeatures={templateByCode.get(role.code)?.features}
                onView={(r) => navigate(buildSlug(r.name, r.id))}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {customRoles.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Custom roles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {customRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                baseFeatures={templateByCode.get(role.code)?.features}
                onView={(r) => navigate(buildSlug(r.name, r.id))}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      <Dialog
        handle={addDialog}
        icon={Shield}
        title="Add Role"
        description="Name the role. You'll set its permissions next."
        content={(close) => <AddRoleForm orgId={orgId} onCreated={handleCreated} onCancel={close} />}
      />

      <TemplatePickerDialog orgId={orgId} handle={templateDialog} onSuccess={templateDialog.close} />
    </div>
  );
};
