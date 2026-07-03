import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import type { FeatureUnlocks } from '@vritti/quantum-ui/types/catalog-resolver';
import { ArrowRight, KeyRound, Layers, Lock, Monitor, MoreVertical, Shield, Smartphone, Trash2 } from 'lucide-react';
import type React from 'react';
import { composeGrants } from '@/schemas/cloud/role-grants';
import { isDefaultRole, type Role } from '@/schemas/cloud/roles';

interface RoleCardProps {
  role: Role;
  // The role's template grants — effective counts compose template ∪ additions − revoked
  baseFeatures?: FeatureUnlocks;
  onView: (role: Role) => void;
  onDelete: (role: Role) => void;
}

// Rolls the per-feature grants up into headline numbers + platform coverage
function summarize(features: Role['features']) {
  let permissions = 0;
  let web = false;
  let mobile = false;
  for (const f of Object.values(features)) {
    permissions += (f.web?.length ?? 0) + (f.mobile?.length ?? 0);
    if (f.web?.length) web = true;
    if (f.mobile?.length) mobile = true;
  }
  return { features: Object.keys(features).length, permissions, web, mobile };
}

// A role summary card — the footer "View" affordance opens the view page; the ⋮ menu deletes.
export const RoleCard: React.FC<RoleCardProps> = ({ role, baseFeatures, onView, onDelete }) => {
  const s = summarize(composeGrants(baseFeatures ?? {}, role.features, role.revoked));
  const isDefault = isDefaultRole(role);

  return (
    <div className="group relative flex flex-col rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md">
      {/* header — icon tile, name + Default badge, description, ⋮ management menu */}
      <div className="flex items-start gap-3 p-5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isDefault ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/15'
          }`}
        >
          {isDefault ? <Lock className="size-5" /> : <Shield className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{role.name}</h3>
            {isDefault && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{role.description || 'No description'}</p>
        </div>
        <DropdownMenu
          trigger={{
            children: (
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1.5 -mt-1 size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            ),
          }}
          align="end"
          items={[
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
      </div>

      {/* footer — compact stats on the left, primary "View" navigation on the right */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t px-5 py-3">
        <div className="flex min-w-0 items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <KeyRound className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">{s.permissions}</span>
            <span className="hidden sm:inline">{pluralize('permission', s.permissions)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">{s.features}</span>
            <span className="hidden sm:inline">{pluralize('feature', s.features)}</span>
          </span>
          <span
            className="flex items-center gap-1.5"
            title={`Web ${s.web ? 'included' : 'none'} · Mobile ${s.mobile ? 'included' : 'none'}`}
          >
            <Monitor className={`size-3.5 ${s.web ? 'text-foreground' : 'text-muted-foreground/40'}`} />
            <Smartphone className={`size-3.5 ${s.mobile ? 'text-foreground' : 'text-muted-foreground/40'}`} />
          </span>
        </div>
        <Button variant="link" className="h-auto shrink-0 gap-1 p-0 text-sm text-primary" onClick={() => onView(role)}>
          View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
};
