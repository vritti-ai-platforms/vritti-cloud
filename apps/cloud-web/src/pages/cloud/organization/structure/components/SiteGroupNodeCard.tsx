import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Network, Pencil, Plus, Settings, Trash2 } from 'lucide-react';

export interface SiteGroupNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  childCount: number;
  siteCount: number;
  leCount: number;
  onAddChildGroup?: (parentId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onOpenDetail?: (kind: 'group', id: string, name: string) => void;
}

// Site-group card — the management dimension; a primary left rail sets it apart from site cards
export const SiteGroupNodeCard = ({ data }: NodeProps<Node<SiteGroupNodeData>>) => {
  const hasDependents = data.childCount > 0 || data.siteCount > 0;
  const membership =
    data.siteCount > 0
      ? `${data.siteCount} site${data.siteCount === 1 ? '' : 's'}${data.leCount > 1 ? ` · ${data.leCount} LEs` : ''}`
      : data.childCount > 0
        ? `${data.childCount} sub-group${data.childCount === 1 ? '' : 's'}`
        : 'No members yet';

  return (
    <div className="group relative w-55 overflow-hidden rounded-lg border border-primary/30 bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <Handle type="target" position={Position.Top} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Network className="size-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight">{data.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">{data.code}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6"
            title="Open details"
            onClick={(e) => {
              e.stopPropagation();
              data.onOpenDetail?.('group', data.id, data.name);
            }}
          >
            <Settings className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6"
            title="Edit group"
            onClick={(e) => {
              e.stopPropagation();
              data.onEditGroup?.(data.id);
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6"
            title="Add sub-group"
            onClick={(e) => {
              e.stopPropagation();
              data.onAddChildGroup?.(data.id);
            }}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6 text-destructive hover:text-destructive"
            title={hasDependents ? 'Remove sub-groups and member sites first' : 'Delete group'}
            disabled={hasDependents}
            onClick={(e) => {
              e.stopPropagation();
              data.onDeleteGroup?.(data.id);
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-xs text-primary border-primary/25">
          Site Group
        </Badge>
        <span className="text-xs text-muted-foreground">{membership}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />
    </div>
  );
};
