import { ChevronDown, ChevronRight, Globe, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import type { SnapshotFeature } from '../snapshot-types';

interface FeatureRowProps {
  feature: SnapshotFeature;
  nested?: boolean;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({ feature, nested }) => {
  const [expanded, setExpanded] = useState(false);
  const platforms = Object.keys(feature.microfrontends);
  const hasMfeDetail = platforms.length > 0;

  return (
    <div className={nested ? '' : 'rounded-xl border border-border/60 bg-card overflow-hidden'}>
      <button
        type="button"
        onClick={() => hasMfeDetail && setExpanded((e) => !e)}
        className={`flex items-center gap-3 w-full px-4 py-2.5 text-left ${hasMfeDetail ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'} transition-colors`}
      >
        <Globe className="size-3.5 text-success shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium truncate block">{feature.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{feature.code}</span>
        </div>

        {/* Platform indicators */}
        <div className="flex items-center gap-1 shrink-0">
          {platforms.includes('WEB') && (
            <span className="flex items-center justify-center w-5 h-5 rounded bg-warning/15" title="Web">
              <Monitor className="size-3 text-warning" />
            </span>
          )}
          {platforms.includes('MOBILE') && (
            <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/15" title="Mobile">
              <Smartphone className="size-3 text-primary" />
            </span>
          )}
        </div>

        {/* Permission pills */}
        {feature.permissions.length > 0 && (
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            {feature.permissions.slice(0, 4).map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground"
              >
                {perm.slice(0, 3)}
              </span>
            ))}
            {feature.permissions.length > 4 && (
              <span className="text-[9px] text-muted-foreground ml-0.5">+{feature.permissions.length - 4}</span>
            )}
          </div>
        )}

        {hasMfeDetail &&
          (expanded ? (
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground shrink-0 ml-1" />
          ))}
      </button>

      {/* MFE detail panel */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 space-y-2">
          {platforms.map((platform) => {
            const mf = feature.microfrontends[platform];
            return (
              <div key={platform} className="rounded-lg bg-muted/60 border border-border/30 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  {platform === 'WEB' ? (
                    <Monitor className="size-3 text-warning" />
                  ) : (
                    <Smartphone className="size-3 text-primary" />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {platform} Microfrontend
                  </span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-mono">
                  <span className="text-muted-foreground select-none">entry</span>
                  <span className="truncate">{mf.remoteEntry}</span>
                  <span className="text-muted-foreground select-none">module</span>
                  <span>{mf.exposedModule}</span>
                  <span className="text-muted-foreground select-none">route</span>
                  <span className="text-primary">{mf.routePrefix}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
