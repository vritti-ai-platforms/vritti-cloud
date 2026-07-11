import { useDeleteSiteGroup, useOrgStructureSuspense } from '@hooks/cloud/org-structure';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FeatureLocksTab } from '@/components/feature-locks/FeatureLocksTab';
import { RoleAssignmentsTab } from '@/components/role-assignments/RoleAssignmentsTab';
import { EditSiteGroupDialog } from './components/SiteGroupDialogs';

export const SiteGroupViewPage = () => {
  const { orgSlug, structureSlug } = useParams<{ orgSlug: string; structureSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const groupId =
    structureSlug
      ?.replace(/^group-/, '')
      .split('~')
      .pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const editDialog = useDialog();

  const { data: structure } = useOrgStructureSuspense(orgId);
  const deleteMutation = useDeleteSiteGroup();

  const group = structure.siteGroups.find((g) => g.id === groupId);
  if (!group) {
    return <p className="text-sm text-muted-foreground">Site group not found.</p>;
  }

  const parent = group.parentId ? structure.siteGroups.find((g) => g.id === group.parentId) : undefined;
  const childGroups = structure.siteGroups.filter((g) => g.parentId === groupId);
  const memberSites = structure.sites.filter((site) => site.groupId === groupId);

  const deleteBlockedReason =
    memberSites.length > 0
      ? `Cannot delete — ${memberSites.length} site(s) still belong to this group.`
      : childGroups.length > 0
        ? `Cannot delete — ${childGroups.length} sub-group(s) reference this one.`
        : null;

  // Confirms and deletes the site group
  async function handleDelete() {
    if (deleteBlockedReason || !group) return;
    const confirmed = await confirm({
      title: `Delete ${group.name}?`,
      description: `${group.name} (${group.code}) will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteMutation.mutate({ orgId, groupId }, { onSuccess: () => navigate('../structure') });
    }
  }

  const overviewTab = (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" startAdornment={<Edit className="size-4" />} onClick={editDialog.open}>
          Edit
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <DetailField label="Code" type="string" value={group.code} mono />
            <DetailField label="Parent Group" type="string" value={parent?.name ?? '—'} />
            <DetailField
              label="Status"
              type="string"
              value={
                <Badge variant={group.isActive ? 'secondary' : 'outline'}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </Badge>
              }
            />
            <DetailField label="Member Sites" type="string" value={String(memberSites.length)} />
            <DetailField label="Sub-groups" type="string" value={String(childGroups.length)} />
          </div>
        </CardContent>
      </Card>

      <DangerZone
        title="Delete Site Group"
        description={deleteBlockedReason ?? `Permanently delete ${group.name}. This action cannot be undone.`}
        buttonText="Delete"
        onClick={handleDelete}
        disabled={!!deleteBlockedReason || deleteMutation.isPending}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={group.name} description={parent ? `Sub-group of ${parent.name}` : 'Site group'} />

      <Tabs
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: overviewTab },
          {
            value: 'locks',
            label: 'Apps & Features',
            content: <FeatureLocksTab scope={{ kind: 'siteGroup', orgId, groupId }} />,
          },
          {
            value: 'users',
            label: 'Users & Roles',
            content: <RoleAssignmentsTab target={{ kind: 'siteGroup', orgId, groupId }} />,
          },
        ]}
      />

      <EditSiteGroupDialog handle={editDialog} orgId={orgId} siteGroups={structure.siteGroups} group={group} />
    </div>
  );
};
