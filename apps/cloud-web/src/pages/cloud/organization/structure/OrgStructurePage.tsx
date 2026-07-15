import { useOrgStructureSuspense } from '@hooks/cloud/org-structure';
import { Button } from '@vritti/quantum-ui/Button';
import { PageContent } from '@vritti/quantum-ui/PageContent';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { StructureGraph } from './graph/StructureGraph';
import { AddLegalEntityDialog } from './legal-entity/forms/AddLegalEntityDialog';
import { StructureActionsProvider, useStructureActions } from './StructureActionsContext';

interface StructureHeaderActionsProps {
  orgId: string;
  hasLegalEntities: boolean;
}

const StructureHeaderActions = ({ orgId, hasLegalEntities }: StructureHeaderActionsProps) => {
  const actions = useStructureActions();
  return (
    <div className="flex items-center gap-2">
      {hasLegalEntities && <AddLegalEntityDialog orgId={orgId} variant="outline" />}
      <Button
        variant="outline"
        startAdornment={<Plus className="size-4" />}
        size="sm"
        onClick={() => actions.addGroup()}
      >
        Add Site Group
      </Button>
      {hasLegalEntities ? (
        <Button
          variant="default"
          startAdornment={<Plus className="size-4" />}
          size="sm"
          onClick={() => actions.addSite()}
        >
          Add Site
        </Button>
      ) : (
        <AddLegalEntityDialog orgId={orgId} variant="default" />
      )}
    </div>
  );
};

export const OrgStructurePage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';

  const { data: structure } = useOrgStructureSuspense(orgId);
  const legalEntities = structure.legalEntities;
  const hasLegalEntities = legalEntities.length > 0;

  return (
    <StructureActionsProvider orgId={orgId} structure={structure}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Organization Structure"
          description="Legal entities own the money; sites transact; site groups manage across companies. Every site belongs to exactly one legal entity."
          actions={<StructureHeaderActions orgId={orgId} hasLegalEntities={hasLegalEntities} />}
        />

        <PageContent className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <StructureGraph orgId={orgId} structure={structure} />
        </PageContent>

        {legalEntities.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Add a legal entity to start building your organization's structure.
          </p>
        )}
      </div>
    </StructureActionsProvider>
  );
};
