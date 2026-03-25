import { ORGANIZATIONS_QUERY_KEY, useOrganizations } from '@hooks/admin/organizations';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { IndustryFilter } from '@vritti/quantum-ui/selects/industry';
import { PlanFilter } from '@vritti/quantum-ui/selects/plan';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Building2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminOrganization } from '@/schemas/admin/organizations';

const TABLE_SLUG = 'organizations';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useOrganizations();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (org) => navigate(`/organizations/${buildSlug(org.name, org.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'organization',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organizations" description="View all organizations on the platform" />

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
          <PlanFilter key="planId" name="planId" />,
          <IndustryFilter key="industryId" name="industryId" />,
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
          description: 'Organizations created by users will appear here.',
        }}
      />
    </div>
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
      accessorKey: 'planName',
      header: 'Plan',
    },
    {
      accessorKey: 'industryName',
      header: 'Industry',
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <Badge variant="secondary">{row.original.size}</Badge>,
    },
    {
      accessorKey: 'memberCount',
      header: 'Members',
      cell: ({ row }) => row.original.memberCount,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
