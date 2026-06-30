import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { Empty } from '@vritti/quantum-ui/Empty';
import { motion } from '@vritti/quantum-ui/motion';
import { Building2, Globe, Layers, Monitor, Shield } from 'lucide-react';
import type { SnapshotApp, SnapshotRoleTemplate, VersionSnapshot } from '@/schemas/admin/versions';
import { AppNode } from './AppNode';
import { FeatureRow } from './FeatureRow';
import { RoleNode } from './RoleNode';
import { SectionHeader } from './SectionHeader';

interface SnapshotViewProps {
  snapshot: VersionSnapshot;
}

// Orchestrated load — stat pills then business panels reveal in sequence
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } },
};

const StatPill = ({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bg: string;
}) => (
  <motion.div variants={item}>
    <Card>
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
        <div>
          <span className="text-2xl font-bold tracking-tight leading-none tabular-nums">{value}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Small count chip used in the business-panel header summary
const StatChip = ({
  icon: Icon,
  count,
  color,
}: {
  icon: React.FC<{ className?: string }>;
  count: number;
  color: string;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2 py-1 text-xs font-medium tabular-nums">
    <Icon className={`size-3.5 ${color}`} />
    {count}
  </span>
);

// Per-section empty state shown inside a business panel
function SectionEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
      No {label}
    </div>
  );
}

function BusinessPanel({
  code,
  name,
  apps,
  roleTemplates,
  featureByCode,
  featureToApp,
}: {
  code: string;
  name: string;
  apps: SnapshotApp[];
  roleTemplates: SnapshotRoleTemplate[];
  featureByCode: VersionSnapshot['features'];
  featureToApp: Record<string, SnapshotApp>;
}) {
  const totalPerms = roleTemplates.reduce(
    (sum, r) =>
      sum +
      Object.values(r.features ?? {}).reduce((s, p) => s + new Set([...(p.web ?? []), ...(p.mobile ?? [])]).size, 0),
    0,
  );

  return (
    <motion.div variants={item} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <Collapsible
        defaultOpen
        headerClassName="bg-gradient-to-r from-primary/[0.05] to-transparent px-4 py-3.5 hover:from-primary/[0.09] transition-colors"
        triggerClassName="gap-2.5"
        trigger={
          <>
            <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary shrink-0">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground leading-none">
                Business
              </span>
              <div className="flex items-center gap-2 min-w-0 mt-1">
                <span className="text-sm font-bold truncate">{name}</span>
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
                  {code}
                </span>
              </div>
            </div>
          </>
        }
        trailing={
          <div className="flex items-center gap-1.5 shrink-0">
            <StatChip icon={Layers} count={apps.length} color="text-primary" />
            <StatChip icon={Shield} count={roleTemplates.length} color="text-destructive" />
          </div>
        }
      >
        <div className="divide-y divide-border/50 border-t border-border/50">
          {/* Applications */}
          <section className="p-4 space-y-3">
            <SectionHeader icon={Layers} title="Applications" count={apps.length} color="text-primary" />
            {apps.length > 0 ? (
              <div className="space-y-3">
                {apps.map((app) => (
                  <AppNode key={app.code} app={app} featureByCode={featureByCode} />
                ))}
              </div>
            ) : (
              <SectionEmpty label="applications" />
            )}
          </section>

          {/* Role templates */}
          <section className="p-4 space-y-3">
            <SectionHeader
              icon={Shield}
              title="Role Templates"
              count={roleTemplates.length}
              color="text-destructive"
              subtitle={totalPerms > 0 ? `${totalPerms} permission grants` : undefined}
            />
            {roleTemplates.length > 0 ? (
              <div className="space-y-3">
                {roleTemplates.map((role) => (
                  <RoleNode key={role.name} role={role} featureByCode={featureByCode} featureToApp={featureToApp} />
                ))}
              </div>
            ) : (
              <SectionEmpty label="role templates" />
            )}
          </section>
        </div>
      </Collapsible>
    </motion.div>
  );
}

export const SnapshotView: React.FC<SnapshotViewProps> = ({ snapshot }) => {
  // Features are keyed by code — keep the map for lookups, derive the list for stats
  const featureByCode = snapshot.features ?? {};
  const features = Object.values(featureByCode);
  const businesses = snapshot.businesses ?? {};
  const businessCodes = Object.keys(businesses).sort();

  // Reverse feature→app map (across all businesses) for role rendering + the unassigned check
  const allApps: SnapshotApp[] = [];
  const featureToApp: Record<string, SnapshotApp> = {};
  for (const code of businessCodes) {
    for (const app of businesses[code].apps) {
      allApps.push(app);
      for (const fc of app.features) featureToApp[fc] = app;
    }
  }

  // Distinct microfrontends (by code) referenced across all features — one bundle (e.g. commerce-mf) counts once
  const mfCodes = new Set<string>();
  for (const f of features) {
    for (const mf of Object.values(f.microfrontends)) {
      if (mf?.code) mfCodes.add(mf.code);
    }
  }
  const totalMfes = mfCodes.size;

  // Features not referenced by any app across every business
  const assignedCodes = new Set(allApps.flatMap((a) => a.features));
  const unassigned = features.filter((f) => !assignedCodes.has(f.code));

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Stats ribbon */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          icon={Building2}
          label="Businesses"
          value={businessCodes.length}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatPill icon={Globe} label="Features" value={features.length} color="text-success" bg="bg-success/10" />
        <StatPill icon={Monitor} label="Microfrontends" value={totalMfes} color="text-warning" bg="bg-warning/10" />
      </div>

      {/* Business-first: one panel per business, each with Apps + Role Templates */}
      {businessCodes.length > 0 ? (
        <div className="space-y-4">
          {businessCodes.map((code) => (
            <BusinessPanel
              key={code}
              code={code}
              name={businesses[code].name}
              apps={businesses[code].apps}
              roleTemplates={businesses[code].roleTemplates}
              featureByCode={featureByCode}
              featureToApp={featureToApp}
            />
          ))}
        </div>
      ) : (
        <motion.div variants={item}>
          <Empty
            icon={<Building2 />}
            title="No businesses"
            description="Create a snapshot to see this version's businesses here."
          />
        </motion.div>
      )}

      {/* Unassigned features — after all businesses */}
      {unassigned.length > 0 && (
        <motion.div
          variants={item}
          className="rounded-2xl border border-dashed border-border bg-muted/20 overflow-hidden"
        >
          <Collapsible
            defaultOpen
            headerClassName="px-4 py-3.5"
            trigger={
              <SectionHeader
                icon={Globe}
                title="Unassigned Features"
                count={unassigned.length}
                color="text-success"
                subtitle="not bundled in any app"
              />
            }
          >
            <div className="grid gap-2 px-4 pb-4 pt-1 border-t border-border/50">
              {unassigned.map((f) => (
                <FeatureRow key={f.code} feature={f} />
              ))}
            </div>
          </Collapsible>
        </motion.div>
      )}
    </motion.div>
  );
};
