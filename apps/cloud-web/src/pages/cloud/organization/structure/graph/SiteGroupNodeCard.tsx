import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { cn } from '@vritti/quantum-ui/cn';
import { Handle, type Node, type NodeProps, Position } from '@vritti/quantum-ui/react-flow';
import { Network, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { useStructureActions } from '../StructureActionsContext';

export interface SiteGroupNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  childCount: number;
  siteCount: number;
  leCount: number;
  isDropTarget?: boolean;
}

// Site-group card
export const SiteGroupNodeCard = ({ data }: NodeProps<Node<SiteGroupNodeData>>) => {
  const actions = useStructureActions();
  const hasDependents = data.childCount > 0 || data.siteCount > 0;
  const membership =
    data.siteCount > 0
      ? `${data.siteCount} site${data.siteCount === 1 ? '' : 's'}${data.leCount > 1 ? ` · ${data.leCount} LEs` : ''}`
      : data.childCount > 0
        ? `${data.childCount} sub-group${data.childCount === 1 ? '' : 's'}`
        : 'No members yet';

  return (
    <div
      className={cn(
        'group relative w-64 overflow-hidden rounded-lg border border-primary/30 bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
        data.isDropTarget && 'ring-2 ring-primary',
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <Handle type="target" position={Position.Top} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />

      <div className="flex items-start gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Network className="size-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight">{data.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">{data.code}</span>
          </div>
        </div>
      </div>

      <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-card/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="nodrag nopan size-6"
          title="Open details"
          onClick={(e) => {
            e.stopPropagation();
            actions.openDetail('group', data.id, data.name);
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
            actions.editGroup(data.id);
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
            actions.addGroup(data.id);
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
            actions.deleteGroup(data.id);
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-xs text-primary border-primary/25">
          Site Group
        </Badge>
        <span className="text-xs text-muted-foreground">{membership}</span>
      </div>

      {/* Source anchors so member-site lines can leave from the middle of the group's left edge,
          its bottom center, or the middle of its right edge */}
      <Handle
        id="s-left"
        type="source"
        position={Position.Left}
        className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!"
      />
      <Handle
        id="s-center"
        type="source"
        position={Position.Bottom}
        className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!"
      />
      <Handle
        id="s-right"
        type="source"
        position={Position.Right}
        className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!"
      />
    </div>
  );
};
