import { useOrgUsers } from '@hooks/cloud/organizations/useOrgUsers';
import {
  useAssignRole,
  useCompatibleRoles,
  useRemoveRoleAssignment,
  useRoleAssignments,
} from '@hooks/cloud/role-assignments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Pencil, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { RoleAssignment } from '@/schemas/cloud/role-assignments';
import type { RoleAssignmentTarget } from '@/services/cloud/role-assignments.service';

const TARGET_NOUN: Record<RoleAssignmentTarget['kind'], string> = {
  org: 'organization',
  legalEntity: 'legal entity',
  siteGroup: 'site group',
  site: 'site',
};

interface RoleAssignmentsTabProps {
  target: RoleAssignmentTarget;
}

// Users & Roles tab showing role assignments for a target scope (org, legal entity, site group, or site)
export const RoleAssignmentsTab = ({ target }: RoleAssignmentsTabProps) => {
  const targetNoun = TARGET_NOUN[target.kind];
  const assignDialog = useDialog();
  const confirm = useConfirm();
  const preselectedUserIdRef = useRef<string | undefined>(undefined);
  const preselectedRoleIdRef = useRef<string | undefined>(undefined);

  const { data: assignments = [], isLoading } = useRoleAssignments(target);
  const removeMutation = useRemoveRoleAssignment();

  // Confirms and removes a role assignment
  async function handleRemove(assignment: RoleAssignment) {
    const confirmed = await confirm({
      title: `Remove ${assignment.roleName} from ${assignment.userName}?`,
      description: `This user will lose the permissions granted by this role at this ${targetNoun}.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ target, assignmentId: assignment.id });
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </p>
        <Button
          startAdornment={<UserPlus className="size-4" />}
          size="sm"
          onClick={() => {
            preselectedUserIdRef.current = undefined;
            preselectedRoleIdRef.current = undefined;
            assignDialog.open();
          }}
        >
          Assign Role
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      )}

      {!isLoading && assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No users assigned</p>
          <p className="text-xs text-muted-foreground mt-1">
            Assign roles to users at this {targetNoun} to grant permissions.
          </p>
          <Button
            startAdornment={<UserPlus className="size-4" />}
            size="sm"
            className="mt-4"
            onClick={assignDialog.open}
          >
            Assign Role
          </Button>
        </div>
      )}

      {!isLoading &&
        assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Users className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{assignment.userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{assignment.userEmail}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="size-3" />
                  {assignment.roleName}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Change role"
                  onClick={() => {
                    preselectedUserIdRef.current = assignment.userId;
                    preselectedRoleIdRef.current = assignment.roleId;
                    assignDialog.open();
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  title="Remove"
                  onClick={() => handleRemove(assignment)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

      <Dialog
        handle={assignDialog}
        icon={Users}
        title="Assign Role to User"
        description={`Select a user and a role to assign at this ${targetNoun}.`}
        content={(close) => (
          <AssignRoleForm
            target={target}
            defaultUserId={preselectedUserIdRef.current}
            defaultRoleId={preselectedRoleIdRef.current}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </div>
  );
};

interface AssignRoleFormProps {
  target: RoleAssignmentTarget;
  defaultUserId?: string;
  defaultRoleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignRoleForm = ({ target, defaultUserId, defaultRoleId, onSuccess, onCancel }: AssignRoleFormProps) => {
  const form = useForm<{ userId: string; roleId: string }>({
    defaultValues: { userId: defaultUserId ?? '', roleId: defaultRoleId ?? '' },
  });

  const { data: usersResponse } = useOrgUsers(target.orgId);
  const { data: roles = [] } = useCompatibleRoles(target);

  const userList = usersResponse?.result ?? [];

  const userOptions = userList.map((u) => ({ value: u.id, label: `${u.fullName} (${u.email})` }));
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  const mutation = useAssignRole({ onSuccess });

  const isChangingRole = !!defaultUserId;

  return (
    <Form form={form} mutation={mutation} transformSubmit={(data) => ({ target, data })} onCancel={onCancel}>
      <Select
        name="userId"
        label="User"
        placeholder="Select user"
        options={userOptions}
        searchable
        disabled={isChangingRole}
      />
      <Select name="roleId" label="Role" placeholder="Select role" options={roleOptions} searchable />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          {isChangingRole ? 'Save' : 'Assign'}
        </Button>
      </DialogActions>
    </Form>
  );
};
