import { useOrgRoles, useUpdateOrgRole } from '@hooks/cloud/org-roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateOrgRoleData, UpdateOrgRoleData } from '@/schemas/cloud/org-roles';
import { OrgRoleForm } from './components/OrgRoleForm';

export const EditOrgRolePage = () => {
  const { orgSlug, roleId } = useParams<{ orgSlug: string; roleId: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();

  const { data: roles = [], isLoading } = useOrgRoles(orgId);
  const role = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
  const updateMutation = useUpdateOrgRole();

  // Updates the role and navigates back to roles list
  function handleSubmit(data: CreateOrgRoleData) {
    if (!roleId) return;
    const updateData: UpdateOrgRoleData = {
      name: data.name,
      description: data.description,
      scope: data.scope,
      features: data.features,
    };
    updateMutation.mutate(
      { orgId, roleId, data: updateData },
      { onSuccess: () => navigate('..', { replace: true }) },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${role?.name ?? 'Role'}`}
        description="Update role details and permissions."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('..')}
          >
            Cancel
          </Button>
        }
      />

      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      )}

      {!isLoading && !role && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Role not found.
          </CardContent>
        </Card>
      )}

      {!isLoading && role && (
        <Card>
          <CardContent className="p-6">
            <OrgRoleForm
              orgId={orgId}
              role={role}
              onSubmit={handleSubmit}
              isPending={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
