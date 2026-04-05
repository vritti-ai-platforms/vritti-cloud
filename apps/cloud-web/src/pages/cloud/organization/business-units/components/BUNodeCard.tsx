import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type Node, type NodeProps, Handle, Position } from '@vritti/quantum-ui/HierarchyGraph';
import { Building2, Plus, Users } from 'lucide-react';

// Maps BU type to a display badge
function getTypeBadge(type: string) {
  switch (type) {
    case 'ORGANIZATION':
      return { label: 'Org', className: 'bg-primary/15 text-primary border-primary/25' };
    case 'REGION':
      return { label: 'Region', className: 'bg-accent/15 text-accent-foreground border-accent/25' };
    case 'BRANCH':
      return { label: 'Branch', className: 'bg-success/15 text-success border-success/25' };
    case 'FRANCHISEE':
      return { label: 'Franchisee', className: 'bg-warning/15 text-warning border-warning/25' };
    default:
      return { label: type.charAt(0) + type.slice(1).toLowerCase(), className: '' };
  }
}

export interface BUNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  type: string;
  parentId: string | null;
  childCount: number;
  onAddChild?: (parentId: string) => void;
}

// Custom React Flow node rendering a business unit card
export const BUNodeCard = ({ data }: NodeProps<Node<BUNodeData>>) => {
  const typeBadge = getTypeBadge(data.type);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-[260px] p-4 hover:shadow-md transition-shadow cursor-pointer">
      <Handle type="target" position={Position.Top} className="!bg-border !w-3 !h-1.5 !rounded-sm !border-0" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center size-7 rounded-md bg-primary/10 shrink-0">
            <Building2 className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate leading-tight">{data.name}</h3>
            {data.code && (
              <span className="text-[10px] font-mono text-muted-foreground">{data.code}</span>
            )}
          </div>
        </div>

        {/* Add child button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChild?.(data.id);
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="secondary" className={`text-[10px] ${typeBadge.className}`}>
          {typeBadge.label}
        </Badge>
        {data.childCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Building2 className="size-2.5" />
            {data.childCount}
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="size-2.5" />0
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-border !w-3 !h-1.5 !rounded-sm !border-0" />
    </div>
  );
};
