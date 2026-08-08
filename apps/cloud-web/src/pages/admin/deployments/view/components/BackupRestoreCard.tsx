import { useRestoreDatabase, useRunBackup } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DateTimePicker } from '@vritti/quantum-ui/DateTimePicker';
import { DropdownMenu, type MenuItem } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useFormatters } from '@vritti/quantum-ui/hooks';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { Archive, ChevronDown, Clock, DatabaseBackup, History, Layers } from 'lucide-react';
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
import { BackupTimelineGraph } from './BackupTimelineGraph';

// Human-readable bytes (B/KB/MB/GB/TB) for the recovery-window size summary.
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

interface BackupRestoreCardProps {
  deploymentId: string;
  backupState: BackupState;
  backupInfo: BackupInfo;
  retention: number;
  connected: boolean;
  stopped: boolean;
}

// The managed database's backup inventory: recovery window + point-in-time restore, a git-style timeline graph
// (branches per restore, full/incremental/now, auto vs manual, retention), and an on-demand "Backup now" action.
export const BackupRestoreCard: React.FC<BackupRestoreCardProps> = ({
  deploymentId,
  backupState,
  backupInfo,
  retention,
  connected,
  stopped,
}) => {
  const fmt = useFormatters();
  const confirm = useConfirm();
  const runBackup = useRunBackup();
  const restore = useRestoreDatabase();

  const backups = backupInfo.backups;
  const earliest = backups.length > 0 ? backups[0].startUnix : 0;
  const repoTotal = backups.reduce((sum, b) => sum + b.repoBytes, 0);
  const [pitr, setPitr] = useState('');
  const busy = restore.isPending;
  const nowIso = new Date().toISOString();
  // Restore is only allowed from a stopped deployment — pgBackRest refuses to restore over a running Postgres.
  const restorable = stopped && connected && !busy;

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
      <CardContent className="space-y-6">
        {backups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No backups yet — the agent takes the first full backup on its next reconcile.
            </p>
          </div>
        ) : (
          <>
            {/* Recovery window — the span the timeline below covers */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Recovery window</span>
                <span className="font-medium">{fmt.dateTime(isoOf(earliest)).primary} → now</span>
              </div>
              <div className="text-muted-foreground">
                {pluralize('backup', backups.length, true)} ·{' '}
                <span className="font-mono tabular-nums text-foreground">{humanBytes(repoTotal)}</span> on disk ·
                keeping last <span className="text-foreground">{retention}</span> fulls
              </div>
            </div>

            {/* Timeline graph — the hero: lanes per Postgres timeline, branches on restore, click to restore */}
            <BackupTimelineGraph
              backups={backups}
              retention={retention}
              restorable={restorable}
              onRestore={restoreToBackup}
            />

            {/* Point-in-time restore — the destructive action, set apart from the read-only timeline above */}
            <div className="space-y-2 border-t pt-5">
              <div className="flex flex-wrap items-end gap-3">
                <DateTimePicker
                  label="Restore to a point in time"
                  placeholder="Pick a date and time"
                  className="w-72"
                  value={pitr || undefined}
                  minDateTime={isoOf(earliest)}
                  maxDateTime={nowIso}
                  onChange={(value) => setPitr(value ?? '')}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  startAdornment={<History className="size-4" />}
                  disabled={!restorable || !pitr}
                  onClick={restoreToPitr}
                >
                  Restore to time
                </Button>
              </div>
              {!stopped && (
                <p className="text-xs text-muted-foreground">
                  Restore is only available when the deployment is stopped — use Stop in the header first.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
