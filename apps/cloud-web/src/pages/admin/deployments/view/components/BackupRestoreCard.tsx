import { useRestoreDatabase, useRunBackup } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DateTimePicker } from '@vritti/quantum-ui/DateTimePicker';
import { DropdownMenu, type MenuItem } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useFormatters } from '@vritti/quantum-ui/hooks';
import { Archive, ChevronDown, Clock, DatabaseBackup, History, Layers, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import {
  BACKUP_STATE_LABELS,
  BACKUP_STATE_VARIANTS,
  BACKUP_TYPE_LABELS,
  type BackupEntry,
  type BackupInfo,
  type BackupState,
} from '@/schemas/admin/deployments';

// Human-readable bytes (B/KB/MB/GB/TB) for backup sizes.
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

// One full backup and the incrementals/differentials layered on top of it (a pgBackRest restore chain).
interface BackupChain {
  full: BackupEntry;
  deltas: BackupEntry[];
}

// Groups the oldest→newest backup list into restore chains: each full starts a new chain; incr/diff attach
// to the most recent full. A leading incr with no preceding full (shouldn't happen) starts its own chain.
function toChains(backups: BackupEntry[]): BackupChain[] {
  const chains: BackupChain[] = [];
  for (const b of backups) {
    if (b.type === 'full' || chains.length === 0) {
      chains.push({ full: b, deltas: [] });
    } else {
      chains[chains.length - 1].deltas.push(b);
    }
  }
  return chains;
}

interface BackupRestoreCardProps {
  deploymentId: string;
  backupState: BackupState;
  backupInfo: BackupInfo;
  connected: boolean;
}

// The managed database's backup inventory: recovery window + point-in-time restore, a timeline of full-backup
// chains with their incrementals (each restorable), and an on-demand "Backup now" action.
export const BackupRestoreCard: React.FC<BackupRestoreCardProps> = ({
  deploymentId,
  backupState,
  backupInfo,
  connected,
}) => {
  const fmt = useFormatters();
  const confirm = useConfirm();
  const runBackup = useRunBackup();
  const restore = useRestoreDatabase();

  const backups = backupInfo.backups;
  const chains = toChains(backups).reverse(); // newest chain first
  const earliest = backups.length > 0 ? backups[0].startUnix : 0;
  const repoTotal = backups.reduce((sum, b) => sum + b.repoBytes, 0);
  const [pitr, setPitr] = useState('');
  const busy = restore.isPending;
  const nowIso = new Date().toISOString();

  // Every restore path funnels through a destructive confirm; all data written after the target is lost.
  const confirmRestore = async (description: string, vars: { targetTime?: string; setLabel?: string }) => {
    const ok = await confirm({
      title: 'Restore database?',
      description,
      confirmLabel: 'Restore',
      variant: 'destructive',
    });
    if (ok) restore.mutate({ id: deploymentId, ...vars });
  };

  const restoreToBackup = (entry: BackupEntry) =>
    confirmRestore(
      `This overwrites the live database with backup ${entry.label} (${BACKUP_TYPE_LABELS[entry.type]}, ${fmt.dateTime(isoOf(entry.stopUnix)).primary}). Everything written after it is lost, and the deployment goes offline during the restore.`,
      { setLabel: entry.label },
    );

  // pitr is already a UTC ISO string from DateTimePicker.
  const restoreToPitr = () => {
    if (!pitr) return;
    return confirmRestore(
      `This restores the database to ${fmt.dateTime(pitr).primary}. Everything written after that moment is lost, and the deployment goes offline during the restore.`,
      { targetTime: pitr },
    );
  };

  const backupItems: MenuItem[] = [
    {
      type: 'item',
      id: 'incr',
      label: 'Incremental backup',
      icon: Layers,
      onClick: () => runBackup.mutate({ id: deploymentId, type: 'incr' }),
    },
    {
      type: 'item',
      id: 'full',
      label: 'Full backup',
      icon: Archive,
      onClick: () => runBackup.mutate({ id: deploymentId, type: 'full' }),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DatabaseBackup className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                Backup &amp; Restore
                <Badge variant={BACKUP_STATE_VARIANTS[backupState]}>{BACKUP_STATE_LABELS[backupState]}</Badge>
              </CardTitle>
              <CardDescription>Point-in-time backups of the managed database, taken by the agent.</CardDescription>
            </div>
          </div>
          <DropdownMenu
            trigger={{
              children: (
                <Button
                  size="sm"
                  startAdornment={<DatabaseBackup className="size-4" />}
                  endAdornment={<ChevronDown className="size-4" />}
                  disabled={!connected || runBackup.isPending || busy}
                >
                  Backup now
                </Button>
              ),
            }}
            items={backupItems}
            align="end"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {backups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No backups yet — the agent takes the first full backup on its next reconcile.
            </p>
          </div>
        ) : (
          <>
            {/* Recovery window + point-in-time restore: any instant from the oldest backup up to now */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Recovery window</span>
                  <span className="text-sm font-medium">{fmt.dateTime(isoOf(earliest)).primary} → now</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {backups.length} backup{backups.length === 1 ? '' : 's'} ·{' '}
                  <span className="font-mono tabular-nums text-foreground">{humanBytes(repoTotal)}</span> on disk
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3 border-t pt-3">
                <DateTimePicker
                  label="Restore to a point in time"
                  placeholder="Pick a date and time"
                  className="w-64"
                  value={pitr || undefined}
                  minDateTime={isoOf(earliest)}
                  maxDateTime={nowIso}
                  onChange={(value) => setPitr(value ?? '')}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  startAdornment={<History className="size-4" />}
                  disabled={!connected || !pitr || busy}
                  onClick={restoreToPitr}
                >
                  Restore to time
                </Button>
              </div>
            </div>

            {/* Timeline: full-backup chains (newest first), each backup restorable */}
            <div className="space-y-3">
              {chains.map((chain) => (
                <div key={chain.full.label} className="rounded-lg border">
                  <BackupRow
                    entry={chain.full}
                    fmt={fmt}
                    anchor
                    onRestore={restoreToBackup}
                    disabled={!connected || busy}
                  />
                  {chain.deltas
                    .slice()
                    .reverse()
                    .map((delta) => (
                      <BackupRow
                        key={delta.label}
                        entry={delta}
                        fmt={fmt}
                        onRestore={restoreToBackup}
                        disabled={!connected || busy}
                      />
                    ))}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// One backup row inside a chain — the full is the anchor (emphasised); incrementals are indented under it.
// Each row can be restored to (destructive, confirmed by the parent).
const BackupRow: React.FC<{
  entry: BackupEntry;
  fmt: ReturnType<typeof useFormatters>;
  onRestore: (entry: BackupEntry) => void;
  disabled: boolean;
  anchor?: boolean;
}> = ({ entry, fmt, onRestore, disabled, anchor }) => (
  <div className={`flex items-center justify-between gap-4 px-4 py-3 ${anchor ? '' : 'border-t pl-10'}`}>
    <div className="flex items-center gap-3">
      {anchor ? <Archive className="size-4 text-primary" /> : <Layers className="size-4 text-muted-foreground" />}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{entry.label}</span>
          <Badge variant={anchor ? 'secondary' : 'outline'}>{BACKUP_TYPE_LABELS[entry.type]}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{fmt.dateTime(isoOf(entry.stopUnix)).primary}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{humanBytes(entry.repoBytes)}</span>
      <Button
        variant="ghost"
        size="sm"
        startAdornment={<RotateCcw className="size-4" />}
        disabled={disabled}
        onClick={() => onRestore(entry)}
      >
        Restore
      </Button>
    </div>
  </div>
);
