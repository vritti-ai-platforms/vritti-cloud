import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { SortableDragHandle } from '@vritti/quantum-ui/Sortable';
import { Typography } from '@vritti/quantum-ui/Typography';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { FeaturePermission } from '@/schemas/admin/feature-permissions';
import { EditPermissionForm } from '../forms/EditPermissionForm';

interface PermissionCardProps {
  permission: FeaturePermission;
  isDragging: boolean;
  onDelete: (permission: FeaturePermission) => void;
}

// A single draggable permission row — code, label, scope, prerequisites, and inline edit/delete
export const PermissionCard = ({ permission, isDragging, onDelete }: PermissionCardProps) => {
  const editDialog = useDialog();
  const dependsOnCodes = permission.dependsOnCodes ?? [];

  return (
    <Card
      className={`group flex flex-row items-center gap-3 border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/20 dark:hover:bg-card ${isDragging ? 'opacity-95 shadow-lg ring-2 ring-primary' : ''}`}
    >
      {/* Drag handle (fixed 1rem column) */}
      <SortableDragHandle className="text-muted-foreground/50 hover:text-foreground">
        <GripVertical className="size-4" />
      </SortableDragHandle>

      {/* Permission — code chip in a fixed slot so every label starts on the same line */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-48 shrink-0">
          <Badge variant="outline" className="max-w-full font-mono text-xs font-medium" title={permission.code}>
            <span className="truncate">{permission.code}</span>
          </Badge>
        </div>
        <Typography variant="body2" className="truncate font-medium">
          {permission.label}
        </Typography>
      </div>

      {/* Scope */}
      <div className="hidden w-44 shrink-0 sm:block">
        {permission.isGlobal ? (
          <Badge variant="secondary">Global</Badge>
        ) : (
          <Badge variant="outline">Business Specific ({permission.businessIds.length})</Badge>
        )}
      </div>

      {/* Depends on */}
      <div className="hidden w-56 shrink-0 md:block">
        {dependsOnCodes.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {dependsOnCodes.map((code) => (
              <Badge key={code} variant="outline" className="font-mono text-xs">
                {code}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions — revealed on hover/focus (fixed column so rows stay aligned) */}
      <div className="flex w-16 shrink-0 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button variant="ghost" size="icon-sm" aria-label="Edit permission" onClick={editDialog.open}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete permission"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(permission)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog
        handle={editDialog}
        icon={Pencil}
        title="Edit Permission"
        description="Update this permission and its business scope."
        content={(close) => <EditPermissionForm permission={permission} onSuccess={close} onCancel={close} />}
      />
    </Card>
  );
};
