import { useOrgRoles } from '@hooks/cloud/org-roles';
import { useOrgUsers } from '@hooks/cloud/organizations/useOrgUsers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Plus, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import {
  type BURoleAssignment,
  assignBURole,
  getBURoleAssignments,
  removeBURoleAssignment,
} from '@/services/cloud/org-business-units.service';

interface UserGroup {
  userId: string;
  userName: string;
  userEmail: string;
  roles: { assignmentId: string; orgRoleId: string; roleName: string }[];
}

// Groups assignments by user, merging roles into a single entry
function groupByUser(assignments: BURoleAssignment[]): UserGroup[] {
  const map = new Map<string, UserGroup>();
  for (const a of assignments) {
    let group = map.get(a.userId);
    if (!group) {
      group = { userId: a.userId, userName: a.userName, userEmail: a.userEmail, roles: [] };
      map.set(a.userId, group);
    }
    group.roles.push({ assignmentId: a.id, orgRoleId: a.orgRoleId, roleName: a.roleName });
  }
  return [...map.values()];
}

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
  const preselectedRoleIdsRef = useRef<string[]>([]);

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
          startAdornment={<Plus className="size-4" />}
          size="sm"
          onClick={() => {
            preselectedUserIdRef.current = undefined;
            preselectedRoleIdsRef.current = [];
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
        groupByUser(assignments).map((group) => (
          <Card key={group.userId}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 shrink-0">
                  <Users className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{group.userName}</p>
                  <p className="text-xs text-muted-foreground">{group.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {group.roles.map((r) => (
                  <Badge key={r.assignmentId} variant="secondary" className="gap-1 pr-1">
                    <Shield className="size-3" />
                    {r.roleName}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 ml-0.5 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleRemove({
                          ...assignments.find((a) => a.id === r.assignmentId)!,
                        })
                      }
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground"
                  onClick={() => {
                    preselectedUserIdRef.current = group.userId;
                    preselectedRoleIdsRef.current = group.roles.map((r) => r.orgRoleId);
                    assignDialog.open();
                  }}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Assign role dialog */}
      <Dialog
        open={assignDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) assignDialog.close();
        }}
        title="Assign Role to User"
        description="Select a user and a role to assign at this business unit."
        content={(close) => (
          <AssignRoleForm
            orgId={orgId}
            buId={buId}
            defaultUserId={preselectedUserIdRef.current}
            defaultRoleIds={preselectedRoleIdsRef.current}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </div>
  );
};

// Form for assigning a role to a user
interface AssignRoleFormProps {
  orgId: string;
  buId: string;
  defaultUserId?: string;
  defaultRoleIds?: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignRoleForm = ({ orgId, buId, defaultUserId, defaultRoleIds, onSuccess, onCancel }: AssignRoleFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<{ userId: string; orgRoleIds: string[] }>({
    defaultValues: { userId: defaultUserId ?? '', orgRoleIds: defaultRoleIds ?? [] },
  });

  // Fetch users and roles for the dropdowns
  const { data: usersResponse } = useOrgUsers(orgId);
  const { data: roles = [] } = useOrgRoles(orgId);

  const userList = usersResponse?.result ?? [];

  const userOptions = userList.map((u) => ({ value: u.id, label: `${u.fullName} (${u.email})` }));
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  // Assigns only newly selected roles (skips already-assigned ones)
  const mutation = useMutation<SuccessResponse, AxiosError, { userId: string; orgRoleIds: string[] }>({
    mutationFn: async ({ userId, orgRoleIds }) => {
      const existingSet = new Set(defaultRoleIds ?? []);
      const newRoleIds = orgRoleIds.filter((id) => !existingSet.has(id));
      let lastResult: SuccessResponse = { success: true, message: '' };
      for (const orgRoleId of newRoleIds) {
        lastResult = await assignBURole({ orgId, buId, data: { userId, orgRoleId } });
      }
      return lastResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BU_ASSIGNMENTS_KEY(orgId, buId) });
      onSuccess();
    },
  });

  return (
    <Form form={form} mutation={mutation} showRootError>
      <Select name="userId" label="User" placeholder="Select user" options={userOptions} searchable />
      <Select name="orgRoleIds" label="Roles" placeholder="Select roles" options={roleOptions} searchable multiple />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign
        </Button>
      </div>
    </Form>
  );
};
