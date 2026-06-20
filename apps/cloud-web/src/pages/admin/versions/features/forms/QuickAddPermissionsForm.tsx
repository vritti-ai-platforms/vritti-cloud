import { FEATURE_PERMISSIONS_TABLE_KEY, useBulkCreatePermissions } from '@hooks/admin/feature-permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { CheckboxGroup } from '@vritti/quantum-ui/CheckboxGroup';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

// Standard global permission presets for one-click adding (created with isGlobal = true)
export const PERMISSION_PRESETS: { code: string; label: string }[] = [
  { code: 'view', label: 'View' },
  { code: 'create', label: 'Create' },
  { code: 'edit', label: 'Edit' },
  { code: 'delete', label: 'Delete' },
  { code: 'export', label: 'Export' },
  { code: 'import', label: 'Import' },
  { code: 'print', label: 'Print' },
];

interface QuickAddPermissionsFormProps {
  versionId: string;
  featureId: string;
  existingCodes: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickAddPermissionsForm: React.FC<QuickAddPermissionsFormProps> = ({
  versionId,
  featureId,
  existingCodes,
  onSuccess,
  onCancel,
}) => {
  const missing = PERMISSION_PRESETS.filter((p) => !existingCodes.includes(p.code));
  const [selected, setSelected] = useState<string[]>(missing.map((p) => p.code));
  const bulkMutation = useBulkCreatePermissions(FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId));
  const allAdded = missing.length === 0;

  function handleAdd() {
    const toAdd = missing.filter((p) => selected.includes(p.code));
    if (toAdd.length === 0) return;
    bulkMutation.mutate(
      {
        versionId,
        permissions: toAdd.map((preset) => ({
          featureId,
          code: preset.code,
          label: preset.label,
          isGlobal: true,
          businessIds: [],
        })),
      },
      { onSuccess },
    );
  }

  return (
    <>
      {allAdded ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <div className="relative flex size-14 items-center justify-center rounded-full bg-success/10">
            <ShieldCheck className="size-7 text-success" />
            <CircleCheck className="-right-0.5 -bottom-0.5 absolute size-5 rounded-full bg-background text-success" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">All set</p>
            <p className="text-muted-foreground text-sm">Every standard permission is already added to this feature.</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[200px] flex-col gap-4 px-6 py-4">
          <CheckboxGroup
            label="Permissions"
            clearable
            columns={2}
            options={missing.map((p) => ({ value: p.code, label: p.label }))}
            value={selected}
            onValueChange={setSelected}
          />
        </div>
      )}
      <DialogActions>
        <Button variant="outline" onClick={onCancel}>
          {allAdded ? 'Close' : 'Cancel'}
        </Button>
        {!allAdded && (
          <Button
            onClick={handleAdd}
            disabled={selected.length === 0}
            isLoading={bulkMutation.isPending}
            loadingText="Adding..."
          >
            Add {selected.length}
          </Button>
        )}
      </DialogActions>
    </>
  );
};
