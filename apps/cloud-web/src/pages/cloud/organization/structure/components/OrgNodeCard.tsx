import { Button } from '@vritti/quantum-ui/Button';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Building2, Landmark, Settings } from 'lucide-react';

export interface OrgNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  legalEntityCount: number;
  siteCount: number;
  siteGroupCount: number;
  onOpenDetail?: (kind: 'org', id: string, name: string) => void;
}

// Root account node — filled, elevated treatment that sets it apart from operational site cards
export const OrgNodeCard = ({ data }: NodeProps<Node<OrgNodeData>>) => {
  return (
    <div className="group relative w-65 overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground shadow-md ring-1 ring-primary/40">
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15 shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70">
              Account
            </span>
            <h3 className="truncate text-sm font-semibold leading-tight">{data.name}</h3>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="nodrag nopan size-6 shrink-0 text-primary-foreground/80 opacity-0 transition-opacity hover:bg-primary-foreground/15 hover:text-primary-foreground group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenDetail?.('org', data.id, data.name);
          }}
        >
          <Settings className="size-3.5" />
        </Button>
      </div>

      <div className="relative mt-3 flex items-center gap-1.5 text-xs text-primary-foreground/80">
        <Landmark className="size-3" />
        {data.legalEntityCount} legal {data.legalEntityCount === 1 ? 'entity' : 'entities'} · {data.siteCount}{' '}
        {data.siteCount === 1 ? 'site' : 'sites'} · {data.siteGroupCount}{' '}
        {data.siteGroupCount === 1 ? 'site group' : 'site groups'}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />
    </div>
  );
};
