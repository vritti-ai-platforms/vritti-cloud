import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { Empty } from '@vritti/quantum-ui/Empty';
import { motion } from '@vritti/quantum-ui/motion';
import type {
  ScopeType,
  SnapshotApp,
  SnapshotBusiness,
  SnapshotRoleTemplate,
  VersionSnapshot,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { snapshotFeatureKey } from '@vritti/quantum-ui/types/catalog-resolver';
import { Building2, Globe, Landmark, Layers, Monitor, Network, Shield, Store } from 'lucide-react';
import { SCOPE_SECTION_ORDER } from '@/schemas/admin/features';
import { AppNode } from './AppNode';
import { FeatureRow } from './FeatureRow';
import { RoleNode } from './RoleNode';
import { SectionHeader } from './SectionHeader';

interface SnapshotViewProps {
  snapshot: VersionSnapshot;
}

// Per-scope presentation — label, lucide icon, and design-token color pair (no hardcoded colors)
const SCOPE_META: Record<ScopeType, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> =
  {
    ORG: { label: 'Organization', icon: Building2, color: 'text-foreground', bg: 'bg-foreground/10' },
    LE: { label: 'Legal Entity', icon: Landmark, color: 'text-warning', bg: 'bg-warning/10' },
    SITE_GROUP: { label: 'Site Group', icon: Network, color: 'text-primary', bg: 'bg-primary/10' },
    SITE: { label: 'Site', icon: Store, color: 'text-success', bg: 'bg-success/10' },
  };

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

// Small count chip used in the business-panel + scope-section header summaries
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

// Compact per-scope feature breakdown — one segment per scope, divided
const ScopeBreakdown = ({ counts }: { counts: Record<ScopeType, number> }) => (
  <motion.div variants={item}>
    <Card>
      <CardContent className="flex divide-x divide-border/60 p-0">
        {SCOPE_SECTION_ORDER.map((scope) => {
          const meta = SCOPE_META[scope];
          const Icon = meta.icon;
          return (
            <div key={scope} className="flex flex-1 items-center gap-2.5 px-4 py-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${meta.bg} shrink-0`}>
                <Icon className={`size-4 ${meta.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-lg font-bold tracking-tight leading-none tabular-nums">{counts[scope]}</span>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{meta.label}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </motion.div>
);

// One scope section inside a business panel — apps + role templates for a single scope
function ScopeSection({
  scope,
  apps,
  roles,
  featureByCode,
  featureToApp,
}: {
  scope: ScopeType;
  apps: SnapshotApp[];
  roles: SnapshotRoleTemplate[];
  featureByCode: VersionSnapshot['features'];
  featureToApp: Record<string, SnapshotApp>;
}) {
  const meta = SCOPE_META[scope];
  const Icon = meta.icon;

  return (
    <section className="p-4 space-y-3">
      {/* Scope header — label + per-scope counts */}
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center size-7 rounded-lg ${meta.bg} shrink-0`}>
          <Icon className={`size-4 ${meta.color}`} />
        </div>
        <span className="text-sm font-semibold tracking-tight">{meta.label}</span>
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <StatChip icon={Layers} count={apps.length} color="text-primary" />
          <StatChip icon={Shield} count={roles.length} color="text-destructive" />
        </div>
      </div>

      {/* Applications for this scope */}
      {apps.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
            Applications
          </span>
          {apps.map((app) => (
            <AppNode key={app.code} app={app} scope={scope} featureByCode={featureByCode} />
          ))}
        </div>
      )}

      {/* Role templates for this scope */}
      {roles.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
            Role Templates
          </span>
          {roles.map((role) => (
            <RoleNode key={role.code} role={role} featureByCode={featureByCode} featureToApp={featureToApp} />
          ))}
        </div>
      )}
    </section>
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
  roleTemplates: SnapshotBusiness['roleTemplates'];
  featureByCode: VersionSnapshot['features'];
  featureToApp: Record<string, SnapshotApp>;
}) {
  // Role templates are keyed by code — the same key org roles link to
  const templates = Object.values(roleTemplates ?? {});

  // Group apps + roles by scope; an app appears under every scope for which it has ≥1 feature ref
  const sections = SCOPE_SECTION_ORDER.map((scope) => ({
    scope,
    apps: apps.filter((app) => app.features.some((ref) => ref.scope === scope)),
    roles: templates.filter((role) => role.scope === scope),
  })).filter((section) => section.apps.length > 0 || section.roles.length > 0);

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
            <StatChip icon={Shield} count={templates.length} color="text-destructive" />
          </div>
        }
      >
        {sections.length > 0 ? (
          <div className="divide-y divide-border/50 border-t border-border/50">
            {sections.map((section) => (
              <ScopeSection
                key={section.scope}
                scope={section.scope}
                apps={section.apps}
                roles={section.roles}
                featureByCode={featureByCode}
                featureToApp={featureToApp}
              />
            ))}
          </div>
        ) : (
          <div className="border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground">
            No apps or role templates
          </div>
        )}
      </Collapsible>
    </motion.div>
  );
}

export const SnapshotView: React.FC<SnapshotViewProps> = ({ snapshot }) => {
  // Features are keyed by `${scope}.${code}` — keep the map for lookups, derive the list for stats
  const featureByCode = snapshot.features ?? {};
  const features = Object.values(featureByCode);
  const businesses = snapshot.businesses ?? {};
  const businessCodes = Object.keys(businesses).sort();

  // Reverse feature→app map (across all businesses), keyed by composite `${scope}.${code}` for role rendering + the unassigned check
  const allApps: SnapshotApp[] = [];
  const featureToApp: Record<string, SnapshotApp> = {};
  for (const code of businessCodes) {
    for (const app of businesses[code].apps) {
      allApps.push(app);
      for (const ref of app.features) featureToApp[snapshotFeatureKey(ref.code, ref.scope)] = app;
    }
  }

  // Feature count per scope — powers the breakdown ribbon
  const scopeCounts: Record<ScopeType, number> = { ORG: 0, LE: 0, SITE_GROUP: 0, SITE: 0 };
  for (const f of features) scopeCounts[f.scope] += 1;

  // Distinct microfrontends (by code) referenced across all features — one bundle (e.g. commerce-mf) counts once
  const mfCodes = new Set<string>();
  for (const f of features) {
    for (const mf of Object.values(f.microfrontends)) {
      if (mf?.code) mfCodes.add(mf.code);
    }
  }
  const totalMfes = mfCodes.size;

  // Features not referenced by any app across every business — matched by composite (code, scope)
  const assignedKeys = new Set(allApps.flatMap((a) => a.features.map((ref) => snapshotFeatureKey(ref.code, ref.scope))));
  const unassigned = features.filter((f) => !assignedKeys.has(snapshotFeatureKey(f.code, f.scope)));

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

      {/* Per-scope feature breakdown */}
      <ScopeBreakdown counts={scopeCounts} />

      {/* Business-first: one panel per business, each grouped by workspace scope */}
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
                <FeatureRow key={snapshotFeatureKey(f.code, f.scope)} feature={f} />
              ))}
            </div>
          </Collapsible>
        </motion.div>
      )}
    </motion.div>
  );
};
