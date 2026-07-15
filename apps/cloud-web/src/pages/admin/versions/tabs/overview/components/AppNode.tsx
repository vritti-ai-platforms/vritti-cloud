import { Badge } from '@vritti/quantum-ui/Badge';
import type { ScopeType, SnapshotApp, SnapshotFeature } from '@vritti/quantum-ui/types/catalog-resolver';
import { snapshotFeatureKey } from '@vritti/quantum-ui/types/catalog-resolver';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FeatureRow } from './FeatureRow';

interface AppNodeProps {
  app: SnapshotApp;
  scope: ScopeType;
  featureByCode: Record<string, SnapshotFeature>;
}

export const AppNode: React.FC<AppNodeProps> = ({ app, scope, featureByCode }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  // An app repeats across scopes — render ONLY the feature refs that belong to this scope
  const scopeRefs = app.features.filter((ref) => ref.scope === scope);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* App header — clickable */}
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
          <Layers className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold block truncate">{app.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{app.code}</span>
        </div>
        <Badge variant="outline" className="ml-auto mr-2 shrink-0 text-xs tabular-nums">
          {scopeRefs.length}
        </Badge>
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Nested features — this scope's refs only */}
      {open && scopeRefs.length > 0 && (
        <div className="border-t border-border/40 bg-muted/30">
          {scopeRefs.map((ref, i) => {
            const key = snapshotFeatureKey(ref.code, ref.scope);
            const feature = featureByCode[key];
            if (!feature) {
              return (
                <div
                  key={key}
                  className="px-4 py-2.5 text-xs text-muted-foreground font-mono border-b border-border/20 last:border-b-0"
                >
                  {ref.code}
                </div>
              );
            }
            return (
              <div key={key} className={i < scopeRefs.length - 1 ? 'border-b border-border/20' : ''}>
                <FeatureRow feature={feature} nested />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
