import { useDeleteOrgRole, useOrgRoles } from '@hooks/cloud/org-roles';
import { Button } from '@vritti/quantum-ui/Button';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Copy, Plus, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { OrgRole } from '@/schemas/cloud/org-roles';
import { RoleCard } from './components/RoleCard';
import { TemplatePickerDialog } from './components/TemplatePickerDialog';

export const OrgRolesPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();

  const { data: roles = [], isLoading } = useOrgRoles(orgId);
  const confirm = useConfirm();
  const templateDialog = useDialog();
  const deleteMutation = useDeleteOrgRole();

  // Navigates to the edit page for a role
  function handleEdit(role: OrgRole) {
    navigate(`${role.id}/edit`);
  }

  // Confirms and deletes a role
  async function handleDelete(role: OrgRole) {
    const confirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: `${role.name} and all its permission assignments will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ orgId, roleId: role.id });
  }

  // Separate system and custom roles
  const systemRoles = roles.filter((r) => r.isLocked);
  const customRoles = roles.filter((r) => !r.isLocked);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles and their permissions within your organization"
        actions={
          <div className="flex gap-2">
            <Button
              startAdornment={<Copy className="size-4" />}
              variant="outline"
              size="sm"
              onClick={templateDialog.open}
            >
              From Template
            </Button>
            <Button
              startAdornment={<Plus className="size-4" />}
              size="sm"
              onClick={() => navigate('create')}
            >
              Custom Role
            </Button>
          </div>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`skeleton-${i.toString()}`} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && roles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No roles defined</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first role to manage access control.
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              startAdornment={<Copy className="size-4" />}
              variant="outline"
              size="sm"
              onClick={templateDialog.open}
            >
              From Template
            </Button>
            <Button
              startAdornment={<Plus className="size-4" />}
              size="sm"
              onClick={() => navigate('create')}
            >
              Custom Role
            </Button>
          </div>
        </div>
      )}

      {/* System roles */}
      {systemRoles.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">System roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemRoles.map((role) => (
              <RoleCard key={role.id} role={role} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Custom roles */}
      {customRoles.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Custom roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customRoles.map((role) => (
              <RoleCard key={role.id} role={role} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Template picker dialog — stays as dialog since it's a quick picker */}
      <TemplatePickerDialog
        orgId={orgId}
        handle={templateDialog}
        onSuccess={templateDialog.close}
      />
    </div>
  );
};
