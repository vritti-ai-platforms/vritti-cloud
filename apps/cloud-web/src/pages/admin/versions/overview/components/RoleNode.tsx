import { ChevronDown, ChevronRight, Layers, Shield, Zap } from 'lucide-react';
import { useState } from 'react';
import type { SnapshotApp, SnapshotFeature, SnapshotRoleTemplate } from '@/schemas/admin/versions';

interface RoleNodeProps {
  role: SnapshotRoleTemplate;
  featureByCode: Map<string, SnapshotFeature>;
  featureToApp: Map<string, SnapshotApp>;
}

const SCOPE_COLOR: Record<string, string> = {
  GLOBAL: 'bg-destructive/15 text-destructive',
  SUBTREE: 'bg-warning/15 text-warning',
  SINGLE_BU: 'bg-primary/15 text-primary',
};

export const RoleNode: React.FC<RoleNodeProps> = ({ role, featureByCode, featureToApp }) => {
  const [open, setOpen] = useState(false);
  const featureEntries = Object.entries(role.features ?? {});
  const totalPerms = featureEntries.reduce((sum, [, perms]) => sum + perms.length, 0);

  // Derive apps from feature permissions (deduplicated)
  const derivedApps = new Map<string, SnapshotApp>();
  for (const [featureCode] of featureEntries) {
    const app = featureToApp.get(featureCode);
    if (app) derivedApps.set(app.code, app);
  }
  // Merge explicit role.apps with derived apps
  const explicitApps = role.apps ?? [];
  for (const code of explicitApps) {
    if (!derivedApps.has(code)) {
      derivedApps.set(code, { code, name: code, icon: 'app-window', features: [] });
    }
  }
  const roleApps = Array.from(derivedApps.values());

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 shrink-0">
          <Shield className="size-4 text-destructive" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold block truncate">{role.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {roleApps.length} {roleApps.length === 1 ? 'app' : 'apps'} · {totalPerms} permissions
          </span>
        </div>
        <span
          className={`ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${SCOPE_COLOR[role.scope] ?? 'bg-muted text-muted-foreground'}`}
        >
          {role.scope}
        </span>
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0 ml-2" />
        )}
      </button>

      {open && (
        <div className="border-t border-border/40 bg-muted/30 p-4 space-y-4">
          {/* App access */}
          {roleApps.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                App Access
              </span>
              <div className="flex flex-wrap gap-1.5">
                {roleApps.map((app) => (
                  <span
                    key={app.code}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border/50 px-2.5 py-1 text-xs font-medium"
                  >
                    <Layers className="size-3 text-primary" />
                    {app.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Permission matrix */}
          {featureEntries.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                Feature Permissions
              </span>
              <div className="rounded-lg border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                {featureEntries.map(([featureCode, perms]) => {
                  const feature = featureByCode.get(featureCode);
                  return (
                    <div key={featureCode} className="flex items-center gap-3 px-3 py-2">
                      <Zap className="size-3 text-success shrink-0" />
                      <span className="text-xs font-medium min-w-0 truncate flex-1">
                        {feature?.name ?? featureCode}
                      </span>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {perms.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[9px] font-bold uppercase tracking-wider bg-success/10 text-success"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
