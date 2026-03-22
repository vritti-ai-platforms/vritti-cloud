import { useCreateOrgRole } from '@hooks/cloud/org-roles';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateOrgRoleData } from '@/schemas/cloud/org-roles';
import { OrgRoleForm } from './components/OrgRoleForm';

export const CreateOrgRolePage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();
  const createMutation = useCreateOrgRole();

  // Creates the role and navigates back to roles list
  function handleSubmit(data: CreateOrgRoleData) {
    createMutation.mutate(
      { orgId, data },
      { onSuccess: () => navigate('..', { replace: true }) },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Role"
        description="Define a new role with permissions for your organization."
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
      <Card>
        <CardContent className="p-6">
          <OrgRoleForm
            orgId={orgId}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
