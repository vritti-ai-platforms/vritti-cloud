import type { UseMutationResult } from '@tanstack/react-query';
import { cn } from '@vritti/quantum-ui';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { Form } from '@vritti/quantum-ui/Form';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { UploadFile } from '@vritti/quantum-ui/UploadFile';
import type { AxiosError } from 'axios';
import { ArrowLeft, Download, FileUp } from 'lucide-react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { utils, writeFile } from 'xlsx';
import type { ValidateImportResponse } from '@/schemas/admin/import';

interface ImportDialogProps {
  handle: DialogHandle;
  title: string;
  description: string;
  columns: { key: string; label: string }[];
  validateMutation: UseMutationResult<ValidateImportResponse, AxiosError, File>;
  importMutation: UseMutationResult<SuccessResponse, AxiosError, Record<string, string>[]>;
  sampleData?: Record<string, string>[];
}

interface UploadFormData {
  file: File;
}

const SAMPLE_FORMATS = [
  { id: 'csv', label: 'CSV (.csv)', ext: 'csv', bookType: 'csv' as const },
  { id: 'xlsx', label: 'Excel (.xlsx)', ext: 'xlsx', bookType: 'xlsx' as const },
  { id: 'xls', label: 'Excel 97-2004 (.xls)', ext: 'xls', bookType: 'biff8' as const },
  { id: 'ods', label: 'OpenDocument (.ods)', ext: 'ods', bookType: 'ods' as const },
  { id: 'tsv', label: 'TSV (.tsv)', ext: 'tsv', bookType: 'csv' as const },
];

export const ImportDialog = ({
  handle,
  title,
  description,
  columns,
  validateMutation,
  importMutation,
  sampleData,
}: ImportDialogProps) => {
  const form = useForm<UploadFormData>();

  const validationResult = validateMutation.data ?? null;
  const validRows = validationResult?.rows.filter((r) => r.valid) ?? [];

  function resetState() {
    form.reset();
    validateMutation.reset();
    importMutation.reset();
  }

  // Generates and downloads a sample file in the selected format
  const downloadSample = useCallback(
    (formatId: string) => {
      if (!sampleData?.length) return;
      const format = SAMPLE_FORMATS.find((f) => f.id === formatId);
      if (!format) return;

      const ws = utils.json_to_sheet(sampleData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Sample');

      // TSV uses csv bookType with tab separator
      const opts = formatId === 'tsv' ? { bookType: 'csv' as const, FS: '\t' } : { bookType: format.bookType };
      writeFile(wb, `sample.${format.ext}`, opts);
    },
    [sampleData],
  );

  // Axios success interceptor shows the toast from the backend message
  function handleImport() {
    importMutation.mutate(validRows.map((r) => r.data), {
      onSuccess: () => handle.close(),
    });
  }

  // Step 1: Upload file — Form uses validate mutation directly
  if (!validationResult) {
    return (
      <Dialog
        handle={handle}
        title={title}
        description={description}
        content={() => (
          <Form
            form={form}
            mutation={validateMutation}
            transformSubmit={(data: UploadFormData) => data.file}
            showRootError
            resetOnSuccess={false}
          >
            <UploadFile
              name="file"
              label="File"
              accept=".csv,.xlsx,.xls,.ods,.tsv"
              placeholder="Drop a spreadsheet file"
              hint="Supported formats: CSV, Excel, ODS, TSV"
            />
            <div className="flex items-center justify-between pt-2">
              {sampleData?.length ? (
                <DropdownMenu
                  trigger={{
                    label: 'Download sample',
                    variant: 'ghost',
                    icon: Download,
                    className: 'text-xs h-8',
                  }}
                  items={SAMPLE_FORMATS.map((f) => ({
                    type: 'item' as const,
                    id: f.id,
                    label: f.label,
                    onClick: () => downloadSample(f.id),
                  }))}
                />
              ) : (
                <div />
              )}
              <Button type="submit" size="sm" isLoading={validateMutation.isPending} loadingText="Validating...">
                Validate
              </Button>
            </div>
          </Form>
        )}
      />
    );
  }

  // Step 2: Preview validated rows + Import
  const { summary, rows } = validationResult;

  return (
    <Dialog
      handle={handle}
      title={title}
      description={`${summary.valid} of ${summary.total} rows ready to import`}
      className="max-w-3xl"
      content={() => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{summary.total} total</Badge>
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              {summary.valid} valid
            </Badge>
            {summary.invalid > 0 && (
              <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                {summary.invalid} invalid
              </Badge>
            )}
          </div>

          <div className="max-h-80 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="px-3 py-2 text-left font-medium text-muted-foreground">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.index} className={cn(!row.valid && 'bg-destructive/5')}>
                    <td className="px-3 py-2 text-muted-foreground">{row.index}</td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2">
                        {row.data[col.key] || <span className="text-muted-foreground">-</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-destructive text-xs">{row.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" startAdornment={<ArrowLeft className="size-4" />} onClick={resetState}>
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={validRows.length === 0}
              isLoading={importMutation.isPending}
              loadingText="Importing..."
              startAdornment={<FileUp className="size-4" />}
            >
              Import {validRows.length} items
            </Button>
          </div>
        </div>
      )}
    />
  );
};
