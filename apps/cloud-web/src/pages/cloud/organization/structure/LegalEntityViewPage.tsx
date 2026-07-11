import { useDeleteLegalEntity, useDeleteTaxRegistration, useOrgStructureSuspense } from '@hooks/cloud/org-structure';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { RowActions } from '@vritti/quantum-ui/DataTable';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FeatureLocksTab } from '@/components/feature-locks/FeatureLocksTab';
import { RoleAssignmentsTab } from '@/components/role-assignments/RoleAssignmentsTab';
import { MONTH_OPTIONS, REGIME_LABELS } from '@/schemas/cloud/org-structure';
import { AddRegistrationDialog } from './components/AddRegistrationDialog';
import { EditLegalEntityDialog } from './components/EditLegalEntityDialog';

export const LegalEntityViewPage = () => {
  const { orgSlug, structureSlug } = useParams<{ orgSlug: string; structureSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const leId = structureSlug?.replace(/^le-/, '').split('~').pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const editDialog = useDialog();
  const registrationDialog = useDialog();

  const { data: structure } = useOrgStructureSuspense(orgId);
  const deleteLeMutation = useDeleteLegalEntity();
  const deleteRegMutation = useDeleteTaxRegistration();

  const legalEntity = structure.legalEntities.find((le) => le.id === leId);
  if (!legalEntity) {
    return <p className="text-sm text-muted-foreground">Legal entity not found.</p>;
  }

  const registrations = structure.taxRegistrations.filter((reg) => reg.legalEntityId === leId);
  const linkedSites = structure.sites.filter((site) => site.legalEntityId === leId);
  const childEntities = structure.legalEntities.filter((le) => le.parentId === leId);
  const parent = legalEntity.parentId
    ? structure.legalEntities.find((le) => le.id === legalEntity.parentId)
    : undefined;
  const usedRegistrationIds = new Set(
    structure.sites.map((site) => site.registrationId).filter((id): id is string => !!id),
  );

  const deleteBlockedReason =
    linkedSites.length > 0
      ? `Cannot delete — ${linkedSites.length} site(s) still belong to this legal entity.`
      : childEntities.length > 0
        ? `Cannot delete — ${childEntities.length} subsidiary legal entit(ies) reference this one.`
        : null;

  // Confirms and deletes the legal entity
  async function handleDeleteLe() {
    if (deleteBlockedReason || !legalEntity) return;
    const confirmed = await confirm({
      title: `Delete ${legalEntity.name}?`,
      description: `${legalEntity.name} (${legalEntity.code}) will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteLeMutation.mutate({ orgId, leId }, { onSuccess: () => navigate('../structure') });
    }
  }

  // Confirms and deletes a tax registration
  async function handleDeleteReg(regId: string, taxNumber: string) {
    if (usedRegistrationIds.has(regId)) return;
    const confirmed = await confirm({
      title: `Delete ${taxNumber}?`,
      description: `Tax registration ${taxNumber} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteRegMutation.mutate({ orgId, leId, regId });
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
            <DetailField label="Code" type="string" value={legalEntity.code} mono />
            <DetailField label="Country" type="string" value={legalEntity.country} />
            <DetailField label="Base Currency" type="string" value={legalEntity.currencyCode} />
            <DetailField label="Tax Regime" type="string" value={REGIME_LABELS[legalEntity.taxRegime]} />
            <DetailField label="Tax ID" type="string" value={legalEntity.taxId} mono />
            <DetailField
              label="Fiscal Year Start"
              type="string"
              value={MONTH_OPTIONS[legalEntity.fiscalYearStart - 1]?.label}
            />
            <DetailField label="Parent Legal Entity" type="string" value={parent?.name ?? '—'} />
            <DetailField
              label="Status"
              type="string"
              value={
                <Badge variant={legalEntity.isActive ? 'secondary' : 'outline'}>
                  {legalEntity.isActive ? 'Active' : 'Inactive'}
                </Badge>
              }
            />
            <DetailField label="Linked Sites" type="string" value={String(linkedSites.length)} />
          </div>
        </CardContent>
      </Card>

      <DangerZone
        title="Delete Legal Entity"
        description={deleteBlockedReason ?? `Permanently delete ${legalEntity.name}. This action cannot be undone.`}
        buttonText="Delete"
        onClick={handleDeleteLe}
        disabled={!!deleteBlockedReason || deleteLeMutation.isPending}
      />
    </div>
  );

  const registrationsTab = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tax registrations (GSTIN / VAT number) — one per state or jurisdiction. Sites bill under one of these.
        </p>
        <Button size="sm" startAdornment={<Plus className="size-4" />} onClick={registrationDialog.open}>
          Add Registration
        </Button>
      </div>

      {registrations.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No tax registrations yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Tax Number</th>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{reg.taxNumber}</td>
                  <td className="px-4 py-2">{reg.region ?? '—'}</td>
                  <td className="px-4 py-2">
                    <Badge variant={reg.isActive ? 'secondary' : 'outline'}>
                      {reg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          id: 'delete',
                          icon: Trash2,
                          label: usedRegistrationIds.has(reg.id) ? 'In use by a site' : 'Delete',
                          variant: 'destructive',
                          disabled: usedRegistrationIds.has(reg.id) || deleteRegMutation.isPending,
                          onClick: () => handleDeleteReg(reg.id, reg.taxNumber),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={legalEntity.name} description={parent ? `Subsidiary of ${parent.name}` : 'Legal entity'} />

      <Tabs
        defaultValue="overview"
        tabs={[
          { value: 'overview', label: 'Overview', content: overviewTab },
          { value: 'registrations', label: 'Tax Registrations', content: registrationsTab },
          {
            value: 'users',
            label: 'Users & Roles',
            content: <RoleAssignmentsTab target={{ kind: 'legalEntity', orgId, leId }} />,
          },
          {
            value: 'locks',
            label: 'Apps & Features',
            content: <FeatureLocksTab scope={{ kind: 'legalEntity', orgId, leId }} />,
          },
        ]}
      />

      <EditLegalEntityDialog
        handle={editDialog}
        orgId={orgId}
        legalEntity={legalEntity}
        legalEntities={structure.legalEntities}
      />
      <AddRegistrationDialog handle={registrationDialog} orgId={orgId} legalEntity={legalEntity} />
    </div>
  );
};
