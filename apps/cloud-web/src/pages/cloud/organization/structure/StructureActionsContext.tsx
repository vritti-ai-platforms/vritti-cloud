import { useDeleteSiteGroup } from '@hooks/cloud/org-structure';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Store } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { OrgStructureResponse, SiteGroup } from '@/schemas/cloud/org-structure';
import type { DetailKind } from './graph/structure-layout';
import { LegalEntityManagerDialog } from './legal-entity/LegalEntityManagerDialog';
import { SiteForm } from './site/forms/SiteForm';
import { SiteOrderDialog } from './site/SiteOrderDialog';
import { AddSiteGroupDialog } from './site-group/forms/AddSiteGroupDialog';
import { EditSiteGroupDialog } from './site-group/forms/EditSiteGroupDialog';

export interface StructureActionsContextValue {
  addSite: (legalEntityId?: string) => void;
  manageSites: (legalEntityId: string) => void;
  addGroup: (parentId?: string) => void;
  editGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  manageLegalEntities: () => void;
  openDetail: (kind: DetailKind, id: string, name: string) => void;
}

const StructureActionsContext = createContext<StructureActionsContextValue | null>(null);

interface StructureActionsProviderProps {
  orgId: string;
  structure: OrgStructureResponse;
  children: ReactNode;
}

export const StructureActionsProvider = ({ orgId, structure, children }: StructureActionsProviderProps) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const legalEntities = structure.legalEntities;
  const taxRegistrations = structure.taxRegistrations;

  const createSiteDialog = useDialog();
  const siteLeRef = useRef<string | undefined>(undefined);

  const groupDialog = useDialog();
  const groupParentIdRef = useRef<string | undefined>(undefined);
  const editGroupDialog = useDialog();
  const [editingGroup, setEditingGroup] = useState<SiteGroup | null>(null);
  const deleteGroupMutation = useDeleteSiteGroup();

  const legalEntityManagerDialog = useDialog();

  const siteOrderDialog = useDialog();
  const [manageSitesLeId, setManageSitesLeId] = useState<string | null>(null);

  const addGroup = useCallback(
    (parentId?: string) => {
      groupParentIdRef.current = parentId;
      groupDialog.open();
    },
    [groupDialog.open],
  );

  const editGroup = useCallback(
    (groupId: string) => {
      const group = structure?.siteGroups.find((g) => g.id === groupId) ?? null;
      setEditingGroup(group);
      editGroupDialog.open();
    },
    [structure, editGroupDialog.open],
  );

  const deleteGroup = useCallback(
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

  const addSite = useCallback(
    (legalEntityId?: string) => {
      siteLeRef.current = legalEntityId;
      createSiteDialog.open();
    },
    [createSiteDialog.open],
  );

  const manageSites = useCallback(
    (legalEntityId: string) => {
      setManageSitesLeId(legalEntityId);
      siteOrderDialog.open();
    },
    [siteOrderDialog.open],
  );

  const manageLegalEntities = useCallback(() => {
    legalEntityManagerDialog.open();
  }, [legalEntityManagerDialog.open]);

  const openDetail = useCallback(
    (kind: DetailKind, id: string, name: string) => {
      navigate(`/${orgSlug}/structure/${kind}-${buildSlug(name, id)}`);
    },
    [navigate, orgSlug],
  );

  const value = useMemo<StructureActionsContextValue>(
    () => ({ addSite, manageSites, addGroup, editGroup, deleteGroup, manageLegalEntities, openDetail }),
    [addSite, manageSites, addGroup, editGroup, deleteGroup, manageLegalEntities, openDetail],
  );

  return (
    <StructureActionsContext.Provider value={value}>
      {children}

      <Dialog
        handle={createSiteDialog}
        icon={Store}
        title="Create Site"
        description="A site is a transacting place — an outlet, warehouse, or production facility."
        className="max-w-3xl"
        content={(close) => (
          <SiteForm
            orgId={orgId}
            taxRegistrations={taxRegistrations}
            defaultLegalEntityId={siteLeRef.current}
            onClose={close}
          />
        )}
      />

      <AddSiteGroupDialog handle={groupDialog} orgId={orgId} defaultParentId={groupParentIdRef.current} />
      <EditSiteGroupDialog handle={editGroupDialog} orgId={orgId} group={editingGroup} />
      <LegalEntityManagerDialog handle={legalEntityManagerDialog} orgId={orgId} legalEntities={legalEntities} />
      <SiteOrderDialog
        handle={siteOrderDialog}
        orgId={orgId}
        legalEntity={legalEntities.find((le) => le.id === manageSitesLeId) ?? null}
        sites={structure.sites.filter((s) => s.legalEntityId === manageSitesLeId)}
      />
    </StructureActionsContext.Provider>
  );
};

export function useStructureActions(): StructureActionsContextValue {
  const context = useContext(StructureActionsContext);
  if (!context) {
    throw new Error('useStructureActions must be used within a StructureActionsProvider');
  }
  return context;
}
