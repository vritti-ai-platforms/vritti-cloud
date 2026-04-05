import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { Empty } from '@vritti/quantum-ui/Empty';
import { keyBy } from '@vritti/quantum-ui/lodash';
import { Boxes, Globe, Layers, Monitor, Shield } from 'lucide-react';
import type { SnapshotApp, VersionSnapshot } from '@/schemas/admin/versions';
import { AppNode } from './AppNode';
import { FeatureRow } from './FeatureRow';
import { RoleNode } from './RoleNode';
import { SectionHeader } from './SectionHeader';

interface SnapshotViewProps {
  snapshot: VersionSnapshot;
}

const StatPill = ({ icon: Icon, label, value, color, bg }: { icon: React.FC<{ className?: string }>; label: string; value: number; color: string; bg: string }) => (
  <Card>
    <CardContent className="flex items-center gap-3 px-4 py-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg}`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <div>
        <span className="text-2xl font-bold tracking-tight leading-none">{value}</span>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </CardContent>
  </Card>
);

function EmptySection({ icon: Icon, title }: { icon: React.FC<{ className?: string }>; title: string }) {
  return (
    <Empty
      icon={<Icon />}
      title={`No ${title.toLowerCase()}`}
      description={`Create a snapshot to see ${title.toLowerCase()} here.`}
    />
  );
}

export const SnapshotView: React.FC<SnapshotViewProps> = ({ snapshot }) => {
  const { apps = [], features = [], roleTemplates = [] } = snapshot;
  const featureByCode = keyBy(features, 'code');

  // Reverse map: featureCode → app (for deriving role→app relationships)
  const featureToApp: Record<string, SnapshotApp> = {};
  for (const app of apps) {
    for (const code of app.features) {
      featureToApp[code] = app;
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
      <Collapsible defaultOpen trigger={<SectionHeader icon={Layers} title="Applications" count={apps.length} color="text-primary" />}>
        {apps.length > 0 ? (
          <div className="space-y-3 mt-3">
            {apps.map((app) => (
              <AppNode key={app.code} app={app} featureByCode={featureByCode} />
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <EmptySection icon={Boxes} title="Applications" />
          </div>
        )}
      </Collapsible>

      {/* Standalone features not assigned to any app */}
      {(() => {
        const assignedCodes = new Set(apps.flatMap((a) => a.features));
        const unassigned = features.filter((f) => !assignedCodes.has(f.code));
        if (unassigned.length === 0) return null;
        return (
          <Collapsible defaultOpen trigger={<SectionHeader icon={Globe} title="Unassigned Features" count={unassigned.length} color="text-success" />}>
            <div className="grid gap-2 mt-3">
              {unassigned.map((f) => (
                <FeatureRow key={f.code} feature={f} />
              ))}
            </div>
          </Collapsible>
        );
      })()}

      {/* Role templates as permission matrix */}
      <Collapsible
        defaultOpen
        trigger={
          <SectionHeader
            icon={Shield}
            title="Role Templates"
            count={roleTemplates.length}
            color="text-destructive"
            subtitle={totalPerms > 0 ? `${totalPerms} permission grants` : undefined}
          />
        }
      >
        {roleTemplates.length > 0 ? (
          <div className="space-y-3 mt-3">
            {roleTemplates.map((role) => (
              <RoleNode key={role.name} role={role} featureByCode={featureByCode} featureToApp={featureToApp} />
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <EmptySection icon={Shield} title="Role Templates" />
          </div>
        )}
      </Collapsible>
    </div>
  );
};
