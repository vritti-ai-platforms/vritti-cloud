import { Globe, Layers, Monitor, Shield } from 'lucide-react';
import type { Snapshot, SnapshotApp } from '../snapshot-types';
import { AppNode } from './AppNode';
import { FeatureRow } from './FeatureRow';
import { RoleNode } from './RoleNode';
import { SectionHeader } from './SectionHeader';
import { StatPill } from './StatPill';

interface SnapshotViewProps {
  snapshot: Snapshot;
}

export const SnapshotView: React.FC<SnapshotViewProps> = ({ snapshot }) => {
  const { apps = [], features = [], roleTemplates = [] } = snapshot;
  const featureByCode = new Map(features.map((f) => [f.code, f]));

  // Reverse map: featureCode → app (for deriving role→app relationships)
  const featureToApp = new Map<string, SnapshotApp>();
  for (const app of apps) {
    for (const code of app.features) {
      featureToApp.set(code, app);
    }
  }

  // Count total MFE bindings and permission grants
  const totalMfes = features.reduce((sum, f) => sum + Object.keys(f.microfrontends).length, 0);
  const totalPerms = roleTemplates.reduce(
    (sum, r) => sum + Object.values(r.features ?? {}).reduce((s, p) => s + p.length, 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Stats ribbon */}
      <div className="grid grid-cols-4 gap-3">
        <StatPill icon={Layers} label="Apps" value={apps.length} color="text-primary" bg="bg-primary/10" />
        <StatPill icon={Globe} label="Features" value={features.length} color="text-success" bg="bg-success/10" />
        <StatPill icon={Monitor} label="MFE Bindings" value={totalMfes} color="text-warning" bg="bg-warning/10" />
        <StatPill
          icon={Shield}
          label="Role Templates"
          value={roleTemplates.length}
          color="text-destructive"
          bg="bg-destructive/10"
        />
      </div>

      {/* Apps → Features hierarchy */}
      {apps.length > 0 && (
        <section>
          <SectionHeader icon={Layers} title="Applications" count={apps.length} color="text-primary" />
          <div className="space-y-3 mt-3">
            {apps.map((app) => (
              <AppNode key={app.code} app={app} featureByCode={featureByCode} />
            ))}
          </div>
        </section>
      )}

      {/* Standalone features not assigned to any app */}
      {(() => {
        const assignedCodes = new Set(apps.flatMap((a) => a.features));
        const unassigned = features.filter((f) => !assignedCodes.has(f.code));
        if (unassigned.length === 0) return null;
        return (
          <section>
            <SectionHeader icon={Globe} title="Unassigned Features" count={unassigned.length} color="text-success" />
            <div className="grid gap-2 mt-3">
              {unassigned.map((f) => (
                <FeatureRow key={f.code} feature={f} />
              ))}
            </div>
          </section>
        );
      })()}

      {/* Role templates as permission matrix */}
      {roleTemplates.length > 0 && (
        <section>
          <SectionHeader
            icon={Shield}
            title="Role Templates"
            count={roleTemplates.length}
            color="text-destructive"
            subtitle={`${totalPerms} permission grants`}
          />
          <div className="space-y-3 mt-3">
            {roleTemplates.map((role) => (
              <RoleNode key={role.name} role={role} featureByCode={featureByCode} featureToApp={featureToApp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
