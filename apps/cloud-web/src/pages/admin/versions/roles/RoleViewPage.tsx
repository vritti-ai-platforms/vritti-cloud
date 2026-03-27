import { useDeleteRole, useRole } from '@hooks/admin/roles';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { EditRoleForm } from './forms/EditRoleForm';
import { RolePermissionForm } from './forms/RolePermissionForm';

export const RoleViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();
  const { versionId } = useVersionContext();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: role } = useRole(versionId, id ?? '');

  const deleteMutation = useDeleteRole(versionId, {
    onSuccess: () => navigate('..'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: `${role.name} and all its permission assignments will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={role.name}
        description={role.description || 'Manage this role template'}
        actions={
          <div className="flex items-center gap-2">
            {role.isSystem && <Badge className="bg-success/15 text-success border-success/30">System Role</Badge>}
            <Button variant="outline" size="sm" onClick={editDialog.open} disabled={role.isSystem}>
              Edit
            </Button>
          </div>
        }
      />

      {/* Role info */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permissions</p>
              <p className="text-2xl font-semibold">{role.permissionCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Scope</p>
            <p className="text-lg font-semibold capitalize mt-1">{role.scope.toLowerCase().replace('_', ' ')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Industry</p>
            <p className="text-lg font-semibold mt-1">{role.industryName ?? 'All Industries'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="permissions"
        tabs={[
          {
            value: 'permissions',
            label: 'Permissions',
            content: (
              <div className="pt-4">
                <RolePermissionForm roleId={role.id} />
              </div>
            ),
          },
        ]}
      />

      <DangerZone
        title="Delete this role"
        description="This action cannot be undone. All associated permission assignments will be removed."
        buttonText="Delete Role"
        onClick={handleDelete}
        disabled={!role.canDelete || role.isSystem}
        warning={
          role.isSystem
            ? 'System roles cannot be deleted.'
            : !role.canDelete
              ? 'This role has active assignments. Remove all associations before deleting.'
              : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit Role"
        description="Update the details for this role template."
        content={(close) => <EditRoleForm role={role} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
