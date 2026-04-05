import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { Lock, MoreVertical, Pencil, Shield, Trash2 } from 'lucide-react';
import type React from 'react';
import type { OrgRole } from '@/schemas/cloud/org-roles';

interface RoleCardProps {
  role: OrgRole;
  onEdit: (role: OrgRole) => void;
  onDelete: (role: OrgRole) => void;
}

// Maps scope to a display-friendly badge
function getScopeBadge(scope: OrgRole['scope']) {
  switch (scope) {
    case 'GLOBAL':
      return { label: 'Global', className: 'bg-primary/15 text-primary border-primary/25' };
    case 'SUBTREE':
      return { label: 'Subtree', className: 'bg-warning/15 text-warning border-warning/25' };
    case 'SINGLE_BU':
      return { label: 'Single BU', className: 'bg-accent/15 text-accent-foreground border-accent/25' };
  }
}

// Card displaying a role with scope badge, feature count, and actions
export const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  const scopeBadge = getScopeBadge(role.scope);
  const featureCount = Object.keys(role.features).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            {role.isLocked ? (
              <Lock className="size-5 text-muted-foreground" />
            ) : (
              <Shield className="size-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold truncate">{role.name}</h3>
              {role.isLocked && (
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                  System
                </Badge>
              )}
            </div>

            {role.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{role.description}</p>
            )}

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className={`text-xs ${scopeBadge.className}`}>
                {scopeBadge.label}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="size-3" />
                {featureCount} feature{featureCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Actions */}
          {!role.isLocked && (
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
                  onClick: () => onEdit(role),
                },
                {
                  type: 'item' as const,
                  id: 'delete',
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'destructive',
                  onClick: () => onDelete(role),
                },
              ]}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
