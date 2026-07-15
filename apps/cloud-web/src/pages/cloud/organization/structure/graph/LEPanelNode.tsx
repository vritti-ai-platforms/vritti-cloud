import { Button } from '@vritti/quantum-ui/Button';
import { cn } from '@vritti/quantum-ui/cn';
import type { Node, NodeProps } from '@vritti/quantum-ui/react-flow';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useStructureActions } from '../StructureActionsContext';

export type PanelTone = 'neutral' | 'nested';
export type LeRelationship = 'SUBSIDIARY' | 'LEGAL_ENTITY';

export interface LEPanelData extends Record<string, unknown> {
  tone: PanelTone;
  empty?: boolean;
  legalEntityId: string;
  siteCount: number;
}

const TONE_CLASSES: Record<PanelTone, string> = {
  neutral: 'bg-muted/60 border-border',
  nested: 'bg-muted/50 border-info/40',
};

// Legal-entity territory panel
export const LEPanelNode = ({ data }: NodeProps<Node<LEPanelData>>) => {
  const actions = useStructureActions();
  return (
    <div className={cn('relative h-full w-full rounded-2xl border', TONE_CLASSES[data.tone])}>
      {/* The panel itself is pointer-events:none in the layout, so the control cluster must re-enable pointer events */}
      <div className="pointer-events-auto absolute right-2 top-2 flex items-center gap-0.5 rounded-lg bg-card/70 p-0.5 text-muted-foreground shadow-sm">
        {data.siteCount >= 2 && (
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6 hover:text-foreground"
            title="Reorder sites"
            onClick={(event) => {
              event.stopPropagation();
              actions.manageSites(data.legalEntityId);
            }}
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="nodrag nopan size-6 hover:text-foreground"
          title="Add site"
          onClick={(event) => {
            event.stopPropagation();
            actions.addSite(data.legalEntityId);
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {data.empty && (
        <button
          type="button"
          className="nodrag nopan pointer-events-auto absolute inset-x-0 bottom-0 flex items-end justify-center pb-6 text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            actions.addSite(data.legalEntityId);
          }}
        >
          No sites yet — add one
        </button>
      )}
    </div>
  );
};
