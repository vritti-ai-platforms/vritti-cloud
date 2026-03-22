import { ORG_USERS_QUERY_KEY, useOrgUsers } from '@hooks/cloud/organizations/useOrgUsers';
import { useResendInvite } from '@hooks/cloud/organizations/useResendInvite';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Mail, MoreVertical, Pencil, UserPlus, Users } from 'lucide-react';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { NexusUser } from '@/schemas/cloud/organizations';
import { EditUserForm } from './forms/EditUserForm';
import { InviteUserForm } from './forms/InviteUserForm';

export const UsersPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';

  const queryClient = useQueryClient();
  const { data: response, isLoading } = useOrgUsers(orgId);
  const inviteDialog = useDialog();
  const editDialog = useDialog();
  const editUserRef = useRef<NexusUser | null>(null);
  const confirm = useConfirm();
  const resendMutation = useResendInvite(orgId);

  // Opens the edit dialog for a pending user
  function handleEdit(user: NexusUser) {
    editUserRef.current = user;
    editDialog.open();
  }

  // Confirms and resends invitation email to a pending user
  async function handleResendInvite(user: NexusUser) {
    const confirmed = await confirm({
      title: `Resend invitation to ${user.email}?`,
      description:
        'A new invitation email will be sent with a fresh link to set their password. The previous invitation link will be invalidated.',
      confirmLabel: 'Resend',
    });
    if (confirmed) resendMutation.mutate(user.id);
  }

  const { table } = useDataTable({
    columns: getColumns({ onResendInvite: handleResendInvite, onEdit: handleEdit }),
    slug: `org-users-${orgId}`,
    label: 'user',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: ORG_USERS_QUERY_KEY(orgId) }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Users" description="Manage portal users for this organization" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'fullName', label: 'Name' },
            { id: 'email', label: 'Email' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<UserPlus className="size-4" />} size="sm" onClick={inviteDialog.open}>
              Invite User
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Users,
          title: 'No users yet',
          description: 'Invite your first user to get started.',
          action: (
            <Button startAdornment={<UserPlus className="size-4" />} size="sm" onClick={inviteDialog.open}>
              Invite User
            </Button>
          ),
        }}
      />

      {/* Invite dialog */}
      <Dialog
        open={inviteDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) inviteDialog.close();
        }}
        title="Invite User"
        description="Send an invitation to join this organization's portal."
        content={(close) => <InviteUserForm orgId={orgId} onSuccess={close} onCancel={close} />}
      />

      {/* Edit user dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit User"
        description="Update user details. If the email has changed, resend the invitation to the new address."
        content={(close) =>
          editUserRef.current ? (
            <EditUserForm orgId={orgId} user={editUserRef.current} onSuccess={close} onCancel={close} />
          ) : null
        }
      />
    </div>
  );
};

// Maps status to badge variant and className
function getStatusBadge(status: string): {
  variant: 'default' | 'destructive' | 'secondary' | 'outline';
  className?: string;
} {
  switch (status) {
    case 'ACTIVE':
      return { variant: 'secondary', className: 'bg-success/15 text-success border-success/25' };
    case 'PENDING':
      return { variant: 'secondary', className: 'bg-warning/15 text-warning border-warning/25' };
    case 'SUSPENDED':
      return { variant: 'destructive' };
    default:
      return { variant: 'secondary' };
  }
}

// Formats ISO date string to a readable short format
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface GetColumnsOptions {
  onResendInvite: (user: NexusUser) => void;
  onEdit: (user: NexusUser) => void;
}

// Builds column definitions for the users DataTable
function getColumns({ onResendInvite, onEdit }: GetColumnsOptions): ColumnDef<NexusUser, unknown>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { variant, className } = getStatusBadge(row.original.status);
        return (
          <Badge variant={variant} className={`text-xs ${className || ''}`}>
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        if (row.original.status !== 'PENDING') return null;
        return (
          <DropdownMenu
            trigger={{
              children: (
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              ),
            }}
            items={[
              {
                type: 'item' as const,
                id: 'edit',
                label: 'Edit',
                icon: Pencil,
                onClick: () => onEdit(row.original),
              },
              {
                type: 'item' as const,
                id: 'resend',
                label: 'Resend Invite',
                icon: Mail,
                onClick: () => onResendInvite(row.original),
              },
            ]}
          />
        );
      },
      enableSorting: false,
    },
  ];
}
