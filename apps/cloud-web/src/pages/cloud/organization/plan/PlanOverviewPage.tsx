import { usePermissions } from '@hooks/cloud/roles/usePermissions';
import type { BuMatrixCell, BuMatrixFeature, PlatformBucket } from '@vritti/api-sdk/catalog-resolver';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Empty } from '@vritti/quantum-ui/Empty';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Check, Layers, Lock } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MatrixCard, type MatrixColumn, MatrixRow, PermissionMatrixSkeleton } from '@/components/permission-matrix';
import { MATRIX_PLATFORMS, PLATFORM_LABEL } from '@/schemas/cloud/bu-matrix';

// Read-only view of what the org's plan includes, down to each permission — locked items show their upgrade path.
export const PlanOverviewPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const { data, isLoading } = usePermissions(orgId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });

  const apps = data?.apps ?? [];

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
      ) : apps.length === 0 ? (
        <Empty
          className="min-h-100"
          icon={<Layers />}
          title="No plan configured"
          description="Applications will appear here once your plan is set up."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((app) => {
            const platforms = MATRIX_PLATFORMS.filter((p) => app.features.some((f) => f.platforms.includes(p)));
            const columns: MatrixColumn[] = platforms.map((p) => ({ key: p, label: PLATFORM_LABEL[p] }));
            return (
              <MatrixCard
                key={app.code}
                icon={app.icon}
                name={app.name}
                countLabel={`${app.unlockedCount}/${app.totalCount} included`}
                columns={columns}
                expanded={expanded.has(app.code)}
                onToggleExpanded={() => toggle(app.code)}
              >
                {app.features.map((feature) => (
                  <FeatureRows key={feature.code} feature={feature} columns={columns} />
                ))}
              </MatrixCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

// A per-platform status glyph: included = check, otherwise a lock with the upsell plans in its tooltip
function StatusCell({ cell }: { cell: BuMatrixCell | null }) {
  if (!cell) return null;
  if (cell.inPlan) return <Check className="size-4 text-success" />;
  return (
    <span title={cell.availableIn.length > 0 ? `Available in ${cell.availableIn.join(', ')}` : 'Not included'}>
      <Lock className="size-3.5 text-muted-foreground" />
    </span>
  );
}

function FeatureRows({ feature, columns }: { feature: BuMatrixFeature; columns: MatrixColumn[] }) {
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
