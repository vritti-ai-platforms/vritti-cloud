import { useDeleteRole, useRoles, useRoleTemplates } from '@hooks/cloud/roles';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { KeyRound, Layers, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { composeGrants } from '@/schemas/cloud/role-grants';
import { isDefaultRole, type Role } from '@/schemas/cloud/roles';
import { EditRoleDetailsForm } from './components/EditRoleDetailsForm';
import { RolePermissionForm } from './components/RolePermissionForm';

// Rolls the per-feature grants into headline counts
function summarize(features: Role['features']) {
  let permissions = 0;
  for (const f of Object.values(features)) permissions += (f.web?.length ?? 0) + (f.mobile?.length ?? 0);
  return { permissions, features: Object.keys(features).length };
}

// One stat card mirroring the Role Template view
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export const RoleViewPage = () => {
  const { orgSlug, roleSlug } = useParams<{ orgSlug: string; roleSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const roleId = roleSlug?.split('~').pop() || '';
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: roles = [], isLoading } = useRoles(orgId);
  const role = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
  const { data: templates = [], isLoading: templatesLoading } = useRoleTemplates(orgId);
  const deleteMutation = useDeleteRole();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!role) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">Role not found.</CardContent>
      </Card>
    );
  }

  // Stats count the EFFECTIVE grants (template ∪ additions − revoked)
  const baseTemplate = templates.find((t) => t.code === role.code);
  const stats = summarize(composeGrants(baseTemplate?.features ?? {}, role.features, role.revoked));
  const isDefault = isDefaultRole(role);

  // Confirm then delete, returning to the roles list
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: `${role.name} and all its permission assignments will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed)
      deleteMutation.mutate({ orgId, roleId: role.id }, { onSuccess: () => navigate('..', { relative: 'path' }) });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={role.name}
        titleSlot={
          !templatesLoading &&
          (baseTemplate ? (
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Based on {baseTemplate.name}
              </Badge>
              {!isDefault && (
                <Badge variant="outline" className="text-xs">
                  Customized
                </Badge>
              )}
            </span>
          ) : (
            <Badge variant="outline" className="border-warning/40 text-xs text-warning">
              Base template missing
            </Badge>
          ))
        }
        description={role.description || 'Manage this role'}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<KeyRound className="size-6" />} label="Permissions" value={stats.permissions} />
        <StatCard icon={<Layers className="size-6" />} label="Features" value={stats.features} />
      </div>

      <RolePermissionForm orgId={orgId} role={role} />

      <DangerZone
        title="Delete this role"
        description="This action cannot be undone. All associated permission assignments will be removed."
        buttonText="Delete Role"
        onClick={handleDelete}
      />

      <Dialog
        handle={editDialog}
        icon={Shield}
        title="Role Settings"
        description="Update this role's name and description."
        content={(close) => <EditRoleDetailsForm orgId={orgId} role={role} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
