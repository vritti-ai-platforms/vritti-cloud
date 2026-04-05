import { useDeleteBusinessUnit, useOrgBusinessUnit, useOrgBusinessUnits } from '@hooks/cloud/org-business-units';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { AppsTab } from './tabs/AppsTab';
import { OverviewTab } from './tabs/OverviewTab';
import { UsersTab } from './tabs/UsersTab';

export const BUViewPage = () => {
  const { orgSlug, buSlug } = useParams<{ orgSlug: string; buSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const buId = buSlug?.split('~').pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: unit } = useOrgBusinessUnit(orgId, buId);
  const { data: allResponse } = useOrgBusinessUnits(orgId);
  const allUnits = allResponse?.result ?? [];
  const deleteMutation = useDeleteBusinessUnit();
  const childCount = allUnits.filter((bu) => bu.parentId === buId).length;
  const hasChildren = childCount > 0;

  // Confirms and deletes the business unit
  async function handleDelete() {
    if (!unit) return;
    const confirmed = await confirm({
      title: `Delete ${unit.name}?`,
      description: `${unit.name} (${unit.code}) will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteMutation.mutate(
        { orgId, buId: unit.id },
        { onSuccess: () => navigate('..') },
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={unit.name}
        description={unit.description ?? `${unit.type ?? ''} business unit`}
      />

      <Tabs
        defaultValue="overview"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: <OverviewTab orgId={orgId} unit={unit} allUnits={allUnits} />,
          },
          {
            value: 'apps',
            label: 'Apps',
            content: <AppsTab orgId={orgId} buId={unit.id} appCodes={unit.appCodes ?? []} />,
          },
          {
            value: 'users',
            label: 'Users & Roles',
            content: <UsersTab orgId={orgId} buId={unit.id} />,
          },
        ]}
      />

      <DangerZone
        title="Delete Business Unit"
        description={
          hasChildren
            ? `Cannot delete ${unit.name} because it has ${childCount} child unit(s). Remove them first.`
            : `Permanently delete ${unit.name}. This action cannot be undone.`
        }
        buttonText="Delete"
        onClick={handleDelete}
        disabled={hasChildren || deleteMutation.isPending}
      />
    </div>
  );
};
