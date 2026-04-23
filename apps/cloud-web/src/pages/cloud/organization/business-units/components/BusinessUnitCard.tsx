import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { Building2, GitBranch, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import type { BusinessUnit } from '@/schemas/cloud/org-business-units';

interface BusinessUnitCardProps {
  unit: BusinessUnit;
  onEdit: (unit: BusinessUnit) => void;
  onDelete: (unit: BusinessUnit) => void;
}

// Maps BU type to a badge style
function getTypeBadge(type: BusinessUnit['type']) {
  switch (type) {
    case 'ORGANIZATION':
      return { className: 'bg-primary/15 text-primary border-primary/25' };
    case 'REGION':
      return { className: 'bg-success/15 text-success border-success/25' };
    case 'FRANCHISEE':
      return { className: 'bg-warning/15 text-warning border-warning/25' };
    case 'BRANCH':
      return { className: 'bg-accent/15 text-accent-foreground border-accent/25' };
    default:
      return { className: 'bg-muted text-muted-foreground' };
  }
}

// Builds a compact location string from metadata fields
function formatLocation(unit: BusinessUnit): string | null {
  const parts = [unit.city, unit.state, unit.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

// Card displaying a business unit with type, parent, depth, and metadata
export const BusinessUnitCard: React.FC<BusinessUnitCardProps> = ({ unit, onEdit, onDelete }) => {
  const typeBadge = getTypeBadge(unit.type);
  const location = formatLocation(unit);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon with depth indicator */}
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold truncate">{unit.name}</h3>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {unit.code}
              </Badge>
            </div>

            {unit.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{unit.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className={`text-xs ${typeBadge.className}`}>
                {unit.type.replace(/_/g, ' ')}
              </Badge>

              {unit.parentName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GitBranch className="size-3" />
                  {unit.parentName}
                </span>
              )}

              {unit.depth > 0 && (
                <span className="text-xs text-muted-foreground">
                  Depth {unit.depth}
                </span>
              )}

              {unit.childCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unit.childCount} child{unit.childCount !== 1 ? 'ren' : ''}
                </span>
              )}
            </div>

            {/* Location metadata */}
            {location && (
              <p className="text-xs text-muted-foreground mt-2">{location}</p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu
            trigger={{
              children: (
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              ),
            }}
            align="end"
            items={[
              {
                type: 'item' as const,
                id: 'edit',
                label: 'Edit',
                icon: Pencil,
                onClick: () => onEdit(unit),
              },
              {
                type: 'item' as const,
                id: 'delete',
                label: 'Delete',
                icon: Trash2,
                variant: 'destructive',
                disabled: unit.childCount > 0,
                onClick: () => onDelete(unit),
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};
