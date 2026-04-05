import { useDeleteRoleTemplate, useRoleTemplate } from '@hooks/admin/role-templates';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Boxes, Factory, GitBranch, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { EditRoleTemplateForm } from './forms/EditRoleTemplateForm';
import { RoleTemplatePermissionForm } from './forms/RoleTemplatePermissionForm';
import { AppsTab } from './tabs/AppsTab';

export const RoleTemplateViewPage = () => {
  const { id } = useSlugParams('roleTemplateSlug');
  const navigate = useNavigate();
  const { versionId } = useVersionContext();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: role } = useRoleTemplate(versionId, id);

  const deleteMutation = useDeleteRoleTemplate(versionId, {
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
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Role info */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permissions</p>
              <p className="text-2xl font-semibold">{role.permissionCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
              <Boxes className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Apps</p>
              <p className="text-2xl font-semibold">{role.appCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
              <GitBranch className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scope</p>
              <p className="text-lg font-semibold capitalize">{role.scope.toLowerCase().replace('_', ' ')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
              <Factory className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="text-lg font-semibold">{role.industryName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="apps"
        tabs={[
          {
            value: 'apps',
            label: 'Apps',
            content: <AppsTab roleId={role.id} />,
          },
          {
            value: 'permissions',
            label: 'Permissions',
            content: (
              <div className="pt-4">
                <RoleTemplatePermissionForm roleId={role.id} />
              </div>
            ),
          },
        ]}
      />

      <DangerZone
        title="Delete this role template"
        description="This action cannot be undone. All associated permission assignments will be removed."
        buttonText="Delete Role Template"
        onClick={handleDelete}
      />

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title="Edit Role Template"
        description="Update the details for this role template."
        content={(close) => <EditRoleTemplateForm role={role} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
