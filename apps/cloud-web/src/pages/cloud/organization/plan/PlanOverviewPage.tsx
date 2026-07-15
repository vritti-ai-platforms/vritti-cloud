import { usePermissions } from '@hooks/cloud/roles/usePermissions';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Empty } from '@vritti/quantum-ui/Empty';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import type {
  PlatformBucket,
  ScopeType,
  SiteMatrixCell,
  SiteMatrixFeature,
} from '@vritti/quantum-ui/types/catalog-resolver';
import { Building2, Check, Landmark, Layers, Lock, Network, Store } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MatrixCard, type MatrixColumn, MatrixRow, PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { SCOPE_SECTION_ORDER } from '@/schemas/admin/features';
import { MATRIX_PLATFORMS, PLATFORM_LABEL } from '@/schemas/cloud/site-matrix';

// Per-scope presentation — label, lucide icon, and design-token color pair (no hardcoded colors)
const SCOPE_META: Record<
  ScopeType,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }
> = {
  ORG: { label: 'Organization', icon: Building2, color: 'text-foreground', bg: 'bg-foreground/10' },
  LE: { label: 'Legal Entity', icon: Landmark, color: 'text-warning', bg: 'bg-warning/10' },
  SITE_GROUP: { label: 'Site Group', icon: Network, color: 'text-primary', bg: 'bg-primary/10' },
  SITE: { label: 'Site', icon: Store, color: 'text-success', bg: 'bg-success/10' },
};

// Read-only view of what the org's plan includes, down to each permission — locked items show their upgrade path.
export const PlanOverviewPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const { data, isLoading } = usePermissions(orgId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const apps = data?.apps ?? [];

  // Group by workspace scope: each scope section lists the apps that carry ≥1 feature at that scope, filtered to that scope's features.
  const sections = SCOPE_SECTION_ORDER.map((scope) => ({
    scope,
    apps: apps
      .map((app) => ({ ...app, features: app.features.filter((f) => f.scope === scope) }))
      .filter((app) => app.features.length > 0),
  })).filter((section) => section.apps.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plan"
        description={
          data
            ? `Your ${data.plan.name} plan — what's included, and what an upgrade unlocks`
            : 'What your plan includes'
        }
      />

      {isLoading ? (
        <PermissionMatrixSkeleton />
      ) : sections.length === 0 ? (
        <Empty
          className="min-h-100"
          icon={<Layers />}
          title="No plan configured"
          description="Applications will appear here once your plan is set up."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section, index) => {
            const meta = SCOPE_META[section.scope];
            const Icon = meta.icon;
            return (
              <section
                key={section.scope}
                className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300"
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
              >
                {/* Scope header */}
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon className={`size-4 ${meta.color}`} />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">{meta.label}</span>
                </div>

                {/* Apps carrying features at this scope */}
                {section.apps.map((app) => {
                  const platforms = MATRIX_PLATFORMS.filter((p) => app.features.some((f) => f.platforms.includes(p)));
                  const columns: MatrixColumn[] = platforms.map((p) => ({ key: p, label: PLATFORM_LABEL[p] }));
                  const cardKey = `${section.scope}.${app.code}`;
                  const unlocked = app.features.filter((f) => f.inPlan).length;
                  return (
                    <MatrixCard
                      key={cardKey}
                      icon={app.icon}
                      name={app.name}
                      countLabel={`${unlocked}/${app.features.length} included`}
                      columns={columns}
                      expanded={expanded.has(cardKey)}
                      onToggleExpanded={() => toggle(cardKey)}
                    >
                      {app.features.map((feature) => (
                        <FeatureRows key={feature.code} feature={feature} columns={columns} />
                      ))}
                    </MatrixCard>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

// A per-platform status glyph: included = check, otherwise a lock with the upsell plans in its tooltip
function StatusCell({ cell }: { cell: SiteMatrixCell | null }) {
  if (!cell) return null;
  if (cell.inPlan) return <Check className="size-4 text-success" />;
  return (
    <span title={cell.availableIn.length > 0 ? `Available in ${cell.availableIn.join(', ')}` : 'Not included'}>
      <Lock className="size-3.5 text-muted-foreground" />
    </span>
  );
}

function FeatureRows({ feature, columns }: { feature: SiteMatrixFeature; columns: MatrixColumn[] }) {
  const onPlatform = (key: string) => feature.platforms.includes(key as PlatformBucket);
  const includedOn = (key: string) => feature.permissions.some((p) => p[key as PlatformBucket]?.inPlan);

  return (
    <div className={feature.inPlan ? undefined : 'opacity-70'}>
      <MatrixRow
        label={
          <span className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DynamicIcon name={(feature.icon ?? 'square') as IconName} className="size-3.5" />
            </span>
            <span className="truncate">{feature.name}</span>
            {!feature.inPlan && feature.availableIn.length > 0 && (
              <Badge variant="outline" className="text-xs font-medium">
                Available in {feature.availableIn.join(', ')}
              </Badge>
            )}
          </span>
        }
        columns={columns}
        renderCell={(key) =>
          !onPlatform(key) ? null : includedOn(key) ? (
            <Check className="size-4 text-success" />
          ) : (
            <Lock className="size-3.5 text-muted-foreground" />
          )
        }
      />

      {feature.permissions.map((perm) => (
        <MatrixRow
          key={perm.code}
          indent
          label={perm.label}
          labelClassName="text-sm text-muted-foreground"
          columns={columns}
          renderCell={(key) => <StatusCell cell={perm[key as PlatformBucket]} />}
        />
      ))}
    </div>
  );
}
