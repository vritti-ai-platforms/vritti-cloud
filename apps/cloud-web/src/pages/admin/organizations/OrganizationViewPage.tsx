import { ORGANIZATION_MEMBERS_QUERY_KEY_FN, useOrganization, useOrganizationMembers } from '@hooks/admin/organizations';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Building2, Cloud, Factory, MapPin, RefreshCw, Server, Users } from 'lucide-react';
import { syncOrgFeatures } from '@/services/admin/organizations.service';
import type { AdminOrganizationMember } from '@/schemas/admin/organizations';

const MEMBERS_TABLE_SLUG = 'organization-members';

export const OrganizationViewPage = () => {
  const { id } = useSlugParams();
  const queryClient = useQueryClient();
  const { data: org, isLoading } = useOrganization(id);

  const syncMutation = useMutation<unknown, AxiosError>({
    mutationFn: () => syncOrgFeatures(id),
  });
  const { data: membersResponse, isLoading: membersLoading } = useOrganizationMembers(id);

  const { table } = useDataTable({
    columns: getMemberColumns(),
    slug: MEMBERS_TABLE_SLUG,
    label: 'member',
    serverState: membersResponse,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: ORGANIZATION_MEMBERS_QUERY_KEY_FN(id) }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!org) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={org.name}
        actions={
          <Button
            variant="outline"
            size="sm"
            startAdornment={<RefreshCw className="size-4" />}
            onClick={() => syncMutation.mutate()}
            isLoading={syncMutation.isPending}
            loadingText="Syncing..."
          >
            Sync Features
          </Button>
        }
        description={`${org.subdomain}.${org.deploymentUrl.replace(/^https?:\/\//, '')}`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-2xl font-semibold">{org.memberCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="text-2xl font-semibold">{org.size}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="text-2xl font-semibold">{org.industryName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{org.planName}</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {org.planCode}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Server className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{org.deploymentName}</span>
              <Badge variant="secondary">{org.deploymentType}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-sm">{org.regionName}</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {org.regionCode}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Cloud className="size-4 text-muted-foreground" />
              <span className="text-sm">{org.cloudProviderName}</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {org.cloudProviderCode}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members DataTable */}
      <DataTable
        table={table}
        isLoading={membersLoading}
        searchConfig={{
          columns: [
            { id: 'fullName', label: 'Name' },
            { id: 'email', label: 'Email' },
          ],
          searchAll: true,
        }}
        emptyStateConfig={{
          icon: Users,
          title: 'No members found',
          description: 'This organization has no members yet.',
        }}
      />
    </div>
  );
};

function getMemberColumns(): ColumnDef<AdminOrganizationMember, unknown>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.profilePictureUrl ? (
            <img src={row.original.profilePictureUrl} alt={row.original.fullName} className="size-8 rounded-full object-cover" />
          ) : (
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{row.original.fullName.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm font-medium">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'Owner' ? 'default' : 'secondary'}>{row.original.role}</Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];
}
