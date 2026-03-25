import { Badge } from '@vritti/quantum-ui/Badge';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { SnapshotApp, SnapshotFeature } from '../snapshot-types';
import { FeatureRow } from './FeatureRow';

interface AppNodeProps {
  app: SnapshotApp;
  featureByCode: Map<string, SnapshotFeature>;
}

export const AppNode: React.FC<AppNodeProps> = ({ app, featureByCode }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

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
          <span className="text-[11px] text-muted-foreground font-mono">{app.code}</span>
        </div>
        <Badge variant="outline" className="ml-auto mr-2 shrink-0 text-xs tabular-nums">
          {app.features.length}
        </Badge>
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Nested features */}
      {open && app.features.length > 0 && (
        <div className="border-t border-border/40 bg-muted/30">
          {app.features.map((code, i) => {
            const feature = featureByCode.get(code);
            if (!feature) {
              return (
                <div
                  key={code}
                  className="px-4 py-2.5 text-xs text-muted-foreground font-mono border-b border-border/20 last:border-b-0"
                >
                  {code}
                </div>
              );
            }
            return (
              <div key={code} className={i < app.features.length - 1 ? 'border-b border-border/20' : ''}>
                <FeatureRow feature={feature} nested />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
