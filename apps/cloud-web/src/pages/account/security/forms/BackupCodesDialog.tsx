import { Dialog } from '@vritti/quantum-ui/Dialog';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import type React from 'react';
import { BackupCodesView } from './BackupCodesView';

interface Props {
  handle: DialogHandle;
  backupCodes: string[];
  warning?: string;
}

export const BackupCodesDialog: React.FC<Props> = ({ handle, backupCodes, warning }) => (
  <Dialog handle={handle} title="Backup Codes">
    <BackupCodesView backupCodes={backupCodes} warning={warning} onDone={handle.close} />
  </Dialog>
);
