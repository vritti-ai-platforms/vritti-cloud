import { useOrgUsers } from '@hooks/cloud/organizations/useOrgUsers';
import { useRoles } from '@hooks/cloud/roles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog, DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Select } from '@vritti/quantum-ui/Select';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import type { AxiosError } from 'axios';
import { Pencil, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  assignBURole,
  type BURoleAssignment,
  getBURoleAssignments,
  removeBURoleAssignment,
} from '@/services/cloud/org-business-units.service';

interface UsersTabProps {
  orgId: string;
  buId: string;
}

const BU_ASSIGNMENTS_KEY = (orgId: string, buId: string) =>
  ['organizations', orgId, 'business-units', buId, 'role-assignments'] as const;

// Users & Roles tab showing role assignments for a business unit
export const UsersTab = ({ orgId, buId }: UsersTabProps) => {
  const queryClient = useQueryClient();
  const assignDialog = useDialog();
  const confirm = useConfirm();
  const preselectedUserIdRef = useRef<string | undefined>(undefined);
  const preselectedRoleIdRef = useRef<string | undefined>(undefined);

  const { data: assignments = [], isLoading } = useQuery<BURoleAssignment[], AxiosError>({
    queryKey: BU_ASSIGNMENTS_KEY(orgId, buId),
    queryFn: () => getBURoleAssignments(orgId, buId),
    enabled: !!buId,
  });

  const removeMutation = useMutation<void, AxiosError, { assignmentId: string }>({
    mutationFn: ({ assignmentId }) => removeBURoleAssignment({ orgId, buId, assignmentId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BU_ASSIGNMENTS_KEY(orgId, buId) }),
  });

  // Confirms and removes a role assignment
  async function handleRemove(assignment: BURoleAssignment) {
    const confirmed = await confirm({
      title: `Remove ${assignment.roleName} from ${assignment.userName}?`,
      description: 'This user will lose the permissions granted by this role at this business unit.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ assignmentId: assignment.id });
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
            Assign roles to users at this business unit to grant permissions.
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

      {/* Assign role dialog */}
      <Dialog
        handle={assignDialog}
        icon={Users}
        title="Assign Role to User"
        description="Select a user and a role to assign at this business unit."
        content={(close) => (
          <AssignRoleForm
            orgId={orgId}
            buId={buId}
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
  orgId: string;
  buId: string;
  defaultUserId?: string;
  defaultRoleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignRoleForm = ({ orgId, buId, defaultUserId, defaultRoleId, onSuccess, onCancel }: AssignRoleFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<{ userId: string; roleId: string }>({
    defaultValues: { userId: defaultUserId ?? '', roleId: defaultRoleId ?? '' },
  });

  // Fetch users and roles for the dropdowns
  const { data: usersResponse } = useOrgUsers(orgId);
  const { data: roles = [] } = useRoles(orgId);

  const userList = usersResponse?.result ?? [];

  const userOptions = userList.map((u) => ({ value: u.id, label: `${u.fullName} (${u.email})` }));
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  // Assigns (or replaces) the user's single role in this BU
  const mutation = useMutation<SuccessResponse, AxiosError, { userId: string; roleId: string }>({
    mutationFn: ({ userId, roleId }) => assignBURole({ orgId, buId, data: { userId, roleId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BU_ASSIGNMENTS_KEY(orgId, buId) });
      onSuccess();
    },
  });

  // Changing an existing user's role — the user is fixed, only the role can be swapped
  const isChangingRole = !!defaultUserId;

  return (
    <Form form={form} mutation={mutation}>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          {isChangingRole ? 'Save' : 'Assign'}
        </Button>
      </DialogActions>
    </Form>
  );
};
