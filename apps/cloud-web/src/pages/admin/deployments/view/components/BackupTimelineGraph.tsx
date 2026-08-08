import { useFormatters } from '@vritti/quantum-ui/hooks';
import type React from 'react';
import { BACKUP_TYPE_LABELS, type BackupEntry } from '@/schemas/admin/deployments';

// Categorical colors from quantum-ui's group palette (light/dark aware) + semantic tokens, as CSS vars.
const TYPE_COLOR: Record<BackupEntry['type'], string> = {
  full: 'var(--color-group-blue)',
  diff: 'var(--color-group-fuchsia)',
  incr: 'var(--color-group-cyan)',
};
const MANUAL_RING = 'var(--color-group-amber)';
const NOW_COLOR = 'var(--color-success)';
const EXPIRE_COLOR = 'var(--color-warning)';
const AXIS = 'var(--color-border)';
const LABEL = 'var(--color-muted-foreground)';
const CARD = 'var(--color-card)';

// Layout constants (SVG user units; the viewBox scales to the container width).
const VW = 760;
const PAD_X = 46;
const TOP = 30;
const LANE_GAP = 74;
const INNER_W = VW - PAD_X * 2;

function humanBytes(n: number): string {
  if (n <= 0) return '0 B';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

const isoOf = (unix: number) => new Date(unix * 1000).toISOString();

// Compact axis-tick labels (the recovery window can span hours, so the time matters as much as the date).
const axisDate = (unix: number) =>
  new Date(unix * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const axisTime = (unix: number) =>
  new Date(unix * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

interface BackupTimelineGraphProps {
  backups: BackupEntry[];
  retention: number;
  restorable: boolean;
  onRestore: (entry: BackupEntry) => void;
}

// A git-style graph of the backup history: one lane per Postgres timeline, branch connectors where a restore
// created a new timeline, full ▲ / incremental ● markers positioned in time, a ● now dot on the active timeline,
// scheduled (hollow) vs manual (filled + amber ring), and dashed markers for chains that expire on the next full.
export const BackupTimelineGraph: React.FC<BackupTimelineGraphProps> = ({
  backups,
  retention,
  restorable,
  onRestore,
}) => {
  const fmt = useFormatters();

  // Time domain: oldest backup → now. Guard a degenerate single-instant range.
  const sorted = [...backups].sort((a, b) => a.startUnix - b.startUnix);
  const t0 = sorted[0].startUnix;
  const nowUnix = Math.floor(Date.now() / 1000);
  const t1 = Math.max(nowUnix, t0 + 1);
  const x = (unix: number) => PAD_X + ((unix - t0) / (t1 - t0)) * INNER_W;

  // One lane per timeline (ascending); the highest timeline is the active one (gets the "now" dot).
  const timelines = [...new Set(sorted.map((b) => b.timeline))].sort((a, b) => a - b);
  const laneOf = new Map(timelines.map((tl, i) => [tl, i]));
  const laneY = (tl: number) => TOP + (laneOf.get(tl) ?? 0) * LANE_GAP;
  const activeTimeline = timelines[timelines.length - 1];

  // Retention: the oldest (numFulls − retention) full-chains expire on the next full. Mark each backup whose
  // anchoring full is in that set (walk each timeline in order, carrying the current full's expiry state).
  const fulls = sorted.filter((b) => b.type === 'full');
  const expiringFulls = new Set(fulls.slice(0, Math.max(0, fulls.length - retention)).map((f) => f.label));
  const expiring = new Map<string, boolean>();
  for (const tl of timelines) {
    let chainExpiring = false;
    for (const b of sorted.filter((s) => s.timeline === tl)) {
      if (b.type === 'full') chainExpiring = expiringFulls.has(b.label);
      expiring.set(b.label, chainExpiring);
    }
  }

  // Branch connectors: each timeline beyond the first peels off the lane above it, at its first backup.
  const branches = timelines.slice(1).map((tl) => {
    const first = sorted.find((b) => b.timeline === tl);
    const fx = first ? x(first.startUnix) : PAD_X;
    const parentLane = (laneOf.get(tl) ?? 0) - 1;
    return { fromY: TOP + parentLane * LANE_GAP, toX: fx, toY: laneY(tl) };
  });

  // Per-timeline lane extents (draw the connecting line under that timeline's markers).
  const laneSpans = timelines.map((tl) => {
    const xs = sorted.filter((b) => b.timeline === tl).map((b) => x(b.startUnix));
    const start = Math.min(...xs);
    const end = tl === activeTimeline ? x(t1) : Math.max(...xs);
    return { tl, start, end, y: laneY(tl) };
  });

  const height = TOP + (timelines.length - 1) * LANE_GAP + 76;
  const axisY = TOP + (timelines.length - 1) * LANE_GAP + 34;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => t0 + f * (t1 - t0));

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${VW} ${height}`} width="100%" role="img" aria-label="Backup timeline graph">
        {/* date axis */}
        <line x1={PAD_X - 6} y1={axisY} x2={VW - PAD_X + 6} y2={axisY} stroke={AXIS} />
        {ticks.map((t, i) =>
          i === ticks.length - 1 ? (
            <g key={t}>
              <line x1={x(t)} y1={axisY} x2={x(t)} y2={axisY + 4} stroke={AXIS} />
              <text x={x(t)} y={axisY + 16} fill={LABEL} fontSize={10} textAnchor="middle">
                now
              </text>
            </g>
          ) : (
            <g key={t}>
              <line x1={x(t)} y1={axisY} x2={x(t)} y2={axisY + 4} stroke={AXIS} />
              <text x={x(t)} y={axisY + 15} fill={LABEL} fontSize={10} textAnchor="middle">
                <tspan x={x(t)}>{axisDate(t)}</tspan>
                <tspan x={x(t)} dy="11">
                  {axisTime(t)}
                </tspan>
              </text>
            </g>
          ),
        )}

        {/* lane baselines + labels */}
        {laneSpans.map((l) => (
          <g key={l.tl}>
            <text x={PAD_X - 40} y={l.y + 3} fill={LABEL} fontSize={10} fontWeight={600}>
              tl {l.tl}
            </text>
            <line x1={l.start} y1={l.y} x2={l.end} y2={l.y} stroke={AXIS} strokeWidth={2} />
          </g>
        ))}

        {/* branch connectors */}
        {branches.map((b, i) => (
          <g key={`br-${i}-${b.toX}`}>
            <path
              d={`M ${b.toX - 22},${b.fromY} C ${b.toX - 22},${(b.fromY + b.toY) / 2} ${b.toX},${(b.fromY + b.toY) / 2} ${b.toX},${b.toY}`}
              fill="none"
              stroke={LABEL}
              strokeWidth={2}
            />
            <text x={b.toX - 20} y={(b.fromY + b.toY) / 2 + 3} fill={LABEL} fontSize={10}>
              ↻ restored
            </text>
          </g>
        ))}

        {/* markers */}
        {sorted.map((b) => {
          const cx = x(b.startUnix);
          const cy = laneY(b.timeline);
          const color = TYPE_COLOR[b.type];
          const manual = b.trigger === 'manual';
          const isExpiring = expiring.get(b.label) ?? false;
          const fill = manual ? color : CARD;
          const opacity = isExpiring ? 0.5 : 1;
          const title = `${BACKUP_TYPE_LABELS[b.type]} · ${b.trigger} · ${fmt.dateTime(isoOf(b.stopUnix)).primary} · ${humanBytes(b.repoBytes)}${isExpiring ? ' · expires next full' : ''}`;
          return (
            // biome-ignore lint/a11y/useSemanticElements: SVG can't contain a <button>; role=button is the accessible pattern for an interactive SVG node
            <g
              key={b.label}
              className="cursor-pointer"
              role="button"
              aria-label={`Restore to ${b.label} — ${title}`}
              tabIndex={restorable ? 0 : -1}
              onClick={() => restorable && onRestore(b)}
              onKeyDown={(e) => {
                if (restorable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRestore(b);
                }
              }}
              style={{ pointerEvents: restorable ? 'auto' : 'none', opacity }}
            >
              <title>{title}</title>
              {manual && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={b.type === 'full' ? 9 : 7}
                  fill="none"
                  stroke={MANUAL_RING}
                  strokeWidth={1.5}
                />
              )}
              {b.type === 'full' ? (
                <polygon
                  points={`${cx},${cy - 6} ${cx + 5},${cy + 5} ${cx - 5},${cy + 5}`}
                  fill={fill}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={isExpiring ? '2 2' : undefined}
                />
              ) : (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={fill}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={isExpiring ? '2 2' : undefined}
                />
              )}
            </g>
          );
        })}

        {/* now dot on the active timeline */}
        <circle cx={x(t1)} cy={laneY(activeTimeline)} r={8} fill="none" stroke={NOW_COLOR} opacity={0.35} />
        <circle cx={x(t1)} cy={laneY(activeTimeline)} r={4} fill={NOW_COLOR} />
        <text
          x={x(t1)}
          y={laneY(activeTimeline) - 12}
          fill={NOW_COLOR}
          fontSize={10}
          fontWeight={600}
          textAnchor="middle"
        >
          now
        </text>
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendItem>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <polygon points="7,2 12,11 2,11" fill={CARD} stroke={TYPE_COLOR.full} strokeWidth={2} />
          </svg>
          full
        </LegendItem>
        <LegendItem>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="4" fill={CARD} stroke={TYPE_COLOR.incr} strokeWidth={2} />
          </svg>
          incremental
        </LegendItem>
        <span className="h-3.5 w-px bg-border" />
        <LegendItem>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="4" fill={CARD} stroke={TYPE_COLOR.incr} strokeWidth={2} />
          </svg>
          scheduled
        </LegendItem>
        <LegendItem>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6" fill="none" stroke={MANUAL_RING} strokeWidth={1.5} />
            <circle cx="8" cy="8" r="4" fill={TYPE_COLOR.incr} stroke={TYPE_COLOR.incr} strokeWidth={2} />
          </svg>
          manual
        </LegendItem>
        <span className="h-3.5 w-px bg-border" />
        <LegendItem>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="4" fill={NOW_COLOR} />
          </svg>
          now
        </LegendItem>
        <LegendItem>
          <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
            <line x1="1" y1="5" x2="21" y2="5" stroke={EXPIRE_COLOR} strokeWidth={2} strokeDasharray="3 2" />
          </svg>
          expires next full
        </LegendItem>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex items-center gap-1.5">{children}</span>
);
