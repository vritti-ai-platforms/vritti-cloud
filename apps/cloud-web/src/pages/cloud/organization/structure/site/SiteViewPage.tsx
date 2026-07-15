import { useDeleteSite, useOrgSite } from '@hooks/cloud/org-sites';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { FeatureLocksTab } from '@/components/feature-locks/FeatureLocksTab';
import { RoleAssignmentsTab } from '@/components/role-assignments/RoleAssignmentsTab';
import { SITE_TYPE_LABELS } from '@/schemas/cloud/org-sites';
import { OverviewTab } from './tabs/OverviewTab';

export const SiteViewPage = () => {
  const { orgSlug, structureSlug } = useParams<{ orgSlug: string; structureSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const siteId =
    structureSlug
      ?.replace(/^site-/, '')
      .split('~')
      .pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: site } = useOrgSite(orgId, siteId);
  const deleteMutation = useDeleteSite();

  // Confirms and deletes the site
  async function handleDelete() {
    if (!site) return;
    const confirmed = await confirm({
      title: `Delete ${site.name}?`,
      description: `${site.name} (${site.code}) will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteMutation.mutate({ orgId, siteId: site.id }, { onSuccess: () => navigate('..') });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={site.name} description={site.description ?? `${SITE_TYPE_LABELS[site.type]} site`} />

      <Tabs
        defaultValue="overview"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: <OverviewTab orgId={orgId} site={site} />,
          },
          {
            value: 'features',
            label: 'Apps & Features',
            content: <FeatureLocksTab scope={{ kind: 'site', orgId, siteId: site.id }} />,
          },
          {
            value: 'users',
            label: 'Users & Roles',
            content: <RoleAssignmentsTab target={{ kind: 'site', orgId, siteId: site.id }} />,
          },
        ]}
      />

      <DangerZone
        title="Delete Site"
        description={`Permanently delete ${site.name}. This action cannot be undone.`}
        buttonText="Delete"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      />
    </div>
  );
};
