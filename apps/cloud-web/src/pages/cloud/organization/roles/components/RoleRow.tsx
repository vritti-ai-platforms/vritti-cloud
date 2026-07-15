import { useCreateRole, useDeleteRole } from '@hooks/cloud/roles';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { CompactSwitch } from '@vritti/quantum-ui/Switch';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Tooltip } from '@vritti/quantum-ui/Tooltip';
import { ChevronRight, Trash2, Users } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';
import type { Role, RoleTemplate } from '@/schemas/cloud/roles';

interface TemplateRowProps {
  orgId: string;
  template: RoleTemplate;
  role?: Role;
}

// A template row — a Switch that creates (ON) or deletes (OFF) the role for this template code.
export const TemplateRow: React.FC<TemplateRowProps> = ({ orgId, template, role }) => {
  const confirm = useConfirm();
  const createMutation = useCreateRole();
  const deleteMutation = useDeleteRole();

  const enabled = !!role;
  const pending = createMutation.isPending || deleteMutation.isPending;
  // An enabled role that is in use can't be disabled — its assignments must be removed first
  const lockedOn = enabled && role ? !role.canDelete : false;

  // Toggling ON creates the role; toggling OFF confirms then deletes it
  async function handleToggle(next: boolean) {
    if (next) {
      createMutation.mutate({
        orgId,
        data: { code: template.code, name: template.name, description: template.description, features: {} },
      });
      return;
    }
    if (!role) return;
    const confirmed = await confirm({
      title: `Disable ${template.name}?`,
      description: 'Its role and permissions will be removed.',
      confirmLabel: 'Disable',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ orgId, roleId: role.id });
  }

  const toggle = (
    <CompactSwitch
      checked={enabled}
      disabled={pending || lockedOn}
      onCheckedChange={handleToggle}
      aria-label={`Toggle ${template.name}`}
    />
  );

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {enabled && role ? (
            <Link
              to={buildSlug(role.name, role.id)}
              className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {template.name}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium text-muted-foreground">{template.name}</span>
          )}
        </div>
        {template.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{template.description}</p>
        )}
        {enabled && role && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
            <Users className="size-3" />
            {role.assignedUserCount} {pluralize('user', role.assignedUserCount)} assigned
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {enabled && role && (
          <Link
            to={buildSlug(role.name, role.id)}
            aria-label={`View ${template.name}`}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </Link>
        )}
        {lockedOn ? (
          <Tooltip content="In use — remove its user assignments first">
            <span>{toggle}</span>
          </Tooltip>
        ) : (
          toggle
        )}
      </div>
    </div>
  );
};

interface CustomRoleRowProps {
  orgId: string;
  role: Role;
}

// A custom-role row — opens the view page on click; a destructive delete button (gated by canDelete).
export const CustomRoleRow: React.FC<CustomRoleRowProps> = ({ orgId, role }) => {
  const confirm = useConfirm();
  const deleteMutation = useDeleteRole();

  // Confirms and deletes the custom role
  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${role.name}?`,
      description: `${role.name} and all its permission assignments will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ orgId, roleId: role.id });
  }

  const deleteButton = (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0 text-destructive hover:text-destructive"
      disabled={!role.canDelete || deleteMutation.isPending}
      onClick={handleDelete}
      aria-label={`Delete ${role.name}`}
    >
      <Trash2 className="size-4" />
    </Button>
  );

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <Link to={buildSlug(role.name, role.id)} className="group min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {role.name}
          </span>
          <Badge variant="outline" className="text-xs">
            Custom
          </Badge>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{role.description || 'No description'}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
          <Users className="size-3" />
          {role.assignedUserCount} {pluralize('user', role.assignedUserCount)} assigned
        </p>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          to={buildSlug(role.name, role.id)}
          aria-label={`View ${role.name}`}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </Link>
        {role.canDelete ? (
          deleteButton
        ) : (
          <Tooltip content="In use — remove assignments first">
            <span>{deleteButton}</span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
