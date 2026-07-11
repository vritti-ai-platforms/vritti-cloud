import { cn } from '@vritti/quantum-ui/cn';
import type { Node, NodeProps } from '@xyflow/react';

export type PanelTone = 'neutral' | 'nested';
export type LeRelationship = 'SUBSIDIARY' | 'LEGAL_ENTITY';

export interface LEPanelData extends Record<string, unknown> {
  tone: PanelTone;
  empty?: boolean;
}

const TONE_CLASSES: Record<PanelTone, string> = {
  neutral: 'bg-muted/60 border-border',
  nested: 'bg-muted/50 border-info/40',
};

// Legal-entity territory — the bordered box behind its sites (header renders as a separate node above the edges)
export const LEPanelNode = ({ data }: NodeProps<Node<LEPanelData>>) => (
  <div className={cn('h-full w-full rounded-2xl border', TONE_CLASSES[data.tone])}>
    {data.empty && (
      <div className="flex h-full items-end justify-center pb-6 text-xs text-muted-foreground">No sites yet</div>
    )}
  </div>
);
