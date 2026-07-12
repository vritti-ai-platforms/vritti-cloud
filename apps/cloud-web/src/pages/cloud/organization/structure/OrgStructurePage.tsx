import { useDeleteSiteGroup, useOrgStructureSuspense } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageContent } from '@vritti/quantum-ui/PageContent';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Plus, Store } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LegalEntity, SiteGroup } from '@/schemas/cloud/org-structure';
import { AddLegalEntityDialog } from './components/AddLegalEntityDialog';
import { AddRegistrationDialog } from './components/AddRegistrationDialog';
import { SiteForm } from './components/SiteForm';
import { AddSiteGroupDialog, EditSiteGroupDialog } from './components/SiteGroupDialogs';
import { StructureGraph } from './components/StructureGraph';
import type { DetailKind } from './components/structure-layout';

export const OrgStructurePage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: structure } = useOrgStructureSuspense(orgId);
  const legalEntities = structure.legalEntities;
  const taxRegistrations = structure.taxRegistrations;
  const siteGroups = structure.siteGroups;
  const hasLegalEntities = legalEntities.length > 0;

  const createSiteDialog = useDialog();

  const groupDialog = useDialog();
  const groupParentIdRef = useRef<string | undefined>(undefined);
  const editGroupDialog = useDialog();
  const [editingGroup, setEditingGroup] = useState<SiteGroup | null>(null);
  const deleteGroupMutation = useDeleteSiteGroup();

  const registrationDialog = useDialog();
  const [registrationEntity, setRegistrationEntity] = useState<LegalEntity | null>(null);

  const handleAddChildGroup = useCallback(
    (parentId: string) => {
      groupParentIdRef.current = parentId;
      groupDialog.open();
    },
    [groupDialog.open],
  );

  const handleEditGroup = useCallback(
    (groupId: string) => {
      const group = structure?.siteGroups.find((g) => g.id === groupId) ?? null;
      setEditingGroup(group);
      editGroupDialog.open();
    },
    [structure, editGroupDialog.open],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      const group = structure?.siteGroups.find((g) => g.id === groupId);
      if (!group) return;
      const confirmed = await confirm({
        title: `Delete ${group.name}?`,
        description: `${group.name} (${group.code}) will be permanently removed. This action cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'destructive',
      });
      if (confirmed) deleteGroupMutation.mutate({ orgId, groupId });
    },
    [structure, confirm, deleteGroupMutation.mutate, orgId],
  );

  const handleAddRegistration = useCallback(
    (legalEntityId: string) => {
      const entity = structure?.legalEntities.find((le) => le.id === legalEntityId) ?? null;
      setRegistrationEntity(entity);
      registrationDialog.open();
    },
    [structure, registrationDialog.open],
  );

  const handleOpenDetail = useCallback(
    (kind: DetailKind, id: string, name: string) => {
      navigate(`/${orgSlug}/structure/${kind}-${buildSlug(name, id)}`);
    },
    [navigate, orgSlug],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organization Structure"
        description="Legal entities own the money; sites transact; site groups manage across companies. Every site belongs to exactly one legal entity."
        actions={
          <div className="flex items-center gap-2">
            {hasLegalEntities && (
              <AddLegalEntityDialog orgId={orgId} legalEntities={legalEntities} variant="outline" />
            )}
            <Button
              variant="outline"
              startAdornment={<Plus className="size-4" />}
              size="sm"
              onClick={() => {
                groupParentIdRef.current = undefined;
                groupDialog.open();
              }}
            >
              Add Site Group
            </Button>
            {hasLegalEntities ? (
              <Button
                variant="default"
                startAdornment={<Plus className="size-4" />}
                size="sm"
                onClick={createSiteDialog.open}
              >
                Add Site
              </Button>
            ) : (
              <AddLegalEntityDialog orgId={orgId} legalEntities={legalEntities} variant="default" />
            )}
          </div>
        }
      />

      <PageContent>
        <StructureGraph
          structure={structure}
          onAddRegistration={handleAddRegistration}
          onOpenDetail={handleOpenDetail}
          onAddChildGroup={handleAddChildGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
        />
      </PageContent>

      {legalEntities.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Add a legal entity to start building your organization's structure.
        </p>
      )}

      <Dialog
        handle={createSiteDialog}
        icon={Store}
        title="Create Site"
        description="A site is a transacting place — an outlet, warehouse, or production facility."
        className="sm:max-w-2xl"
        content={(close) => (
          <SiteForm
            orgId={orgId}
            legalEntities={legalEntities}
            taxRegistrations={taxRegistrations}
            siteGroups={siteGroups}
            onClose={close}
          />
        )}
      />

      <AddSiteGroupDialog
        handle={groupDialog}
        orgId={orgId}
        siteGroups={siteGroups}
        defaultParentId={groupParentIdRef.current}
      />
      <EditSiteGroupDialog handle={editGroupDialog} orgId={orgId} siteGroups={siteGroups} group={editingGroup} />
      <AddRegistrationDialog handle={registrationDialog} orgId={orgId} legalEntity={registrationEntity} />
    </div>
  );
};
