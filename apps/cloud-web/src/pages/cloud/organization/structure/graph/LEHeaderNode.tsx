import { Button } from '@vritti/quantum-ui/Button';
import { cn } from '@vritti/quantum-ui/cn';
import type { Node, NodeProps } from '@vritti/quantum-ui/react-flow';
import { countryFlag } from '@vritti/quantum-ui/selects/iso-country';
import { Settings } from 'lucide-react';
import type { LegalEntity } from '@/schemas/cloud/org-structure';
import { useStructureActions } from '../StructureActionsContext';
import type { LeRelationship } from './LEPanelNode';

export interface LEHeaderData extends Record<string, unknown> {
  legalEntity: LegalEntity;
  relationship: LeRelationship;
  registrationCount: number;
  maxWidth: number;
}

const RELATIONSHIP: Record<LeRelationship, { label: string; badge: string }> = {
  SUBSIDIARY: { label: 'Subsidiary', badge: 'text-info border-info/40 bg-info/5' },
  LEGAL_ENTITY: { label: 'Legal Entity', badge: 'text-muted-foreground border-border bg-card' },
};

const REGIME_LABELS: Record<string, string> = {
  GST: 'GST',
  VAT: 'VAT',
  SALES_TAX: 'Sales Tax',
  NONE: 'No tax',
};

// Legal-entity header pill
export const LEHeaderNode = ({ data }: NodeProps<Node<LEHeaderData>>) => {
  const actions = useStructureActions();
  const le = data.legalEntity;
  const rel = RELATIONSHIP[data.relationship];
  const facts = [
    `${countryFlag(le.country)} ${le.country}`,
    le.currencyCode,
    REGIME_LABELS[le.taxRegime] ?? le.taxRegime,
    `${data.registrationCount} registration${data.registrationCount === 1 ? '' : 's'}`,
  ].join(' · ');

  return (
    <div
      className="group relative flex w-max flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-card py-2 pl-3 pr-12 shadow-sm"
      style={{ maxWidth: data.maxWidth }}
    >
      <span className="text-sm font-semibold">{le.name}</span>
      <span
        className={cn(
          'shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          rel.badge,
        )}
      >
        {rel.label}
      </span>
      <span className="text-xs text-muted-foreground">{facts}</span>

      <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="nodrag nopan size-6"
          onClick={(event) => {
            event.stopPropagation();
            actions.openDetail('le', le.id, le.name);
          }}
        >
          <Settings className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
