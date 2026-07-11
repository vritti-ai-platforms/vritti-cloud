import type { Node, NodeProps } from '@xyflow/react';

export interface GroupBandData extends Record<string, unknown> {
  label: string;
}

// Dashed band behind the site-group cards — the management dimension, crossing legal entities
export const GroupBandNode = ({ data }: NodeProps<Node<GroupBandData>>) => (
  <div className="h-full w-full rounded-xl border border-dashed border-primary/25 bg-primary/5">
    <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-widest text-primary/70">
      {data.label}
    </span>
  </div>
);
