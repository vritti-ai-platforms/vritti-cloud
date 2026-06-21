import { organizationsQueryKey, useOrganizations } from '@hooks/admin/deployments/organizations';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { type ColumnDef, DataTable, NumberCell, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { BusinessFilter } from '@vritti/quantum-ui/selects/business';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { Building2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminOrganization } from '@/schemas/admin/organizations';

const TABLE_SLUG = 'organizations';

interface OrganizationsTabProps {
  deploymentId: string;
  deploymentSlug: string;
}

export const OrganizationsTab: React.FC<OrganizationsTabProps> = ({ deploymentId, deploymentSlug }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useOrganizations(deploymentId);

  const { table } = useDataTable({
    columns: getColumns({
      onView: (org) => navigate(`/deployments/${deploymentSlug}/organizations/${buildSlug(org.name, org.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'organization',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: organizationsQueryKey(deploymentId) }),
  });

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      searchConfig={{
        columns: [
          { id: 'name', label: 'Name' },
          { id: 'subdomain', label: 'Subdomain' },
        ],
        searchAll: true,
      }}
      filters={[
        <BusinessFilter key="businessId" name="businessId" />,
        <SelectFilter
          key="size"
          name="size"
          label="Size"
          options={[
            { label: '0-10', value: '0-10' },
            { label: '10-20', value: '10-20' },
            { label: '20-50', value: '20-50' },
            { label: '50-100', value: '50-100' },
            { label: '100-500', value: '100-500' },
            { label: '500+', value: '500+' },
          ]}
        />,
        <ValueFilter key="memberCount" name="memberCount" label="Members" fieldType="number" />,
      ]}
      emptyStateConfig={{
        icon: Building2,
        title: 'No organizations found',
        description: 'Organizations created on this deployment will appear here.',
      }}
    />
  );
};

interface ColumnActions {
  onView: (org: AdminOrganization) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<AdminOrganization, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'url',
      header: 'URL',
      cell: ({ row }) => (
        <span className="text-sm font-mono text-muted-foreground">
          {row.original.subdomain}.{row.original.deploymentUrl.replace(/^https?:\/\//, '')}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'planCode',
      header: 'Plan',
    },
    {
      accessorKey: 'businessName',
      header: 'Business',
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <Badge variant="secondary">{row.original.size}</Badge>,
    },
    {
      accessorKey: 'memberCount',
      header: 'Members',
      cell: ({ row }) => <NumberCell value={row.original.memberCount} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) }]} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
