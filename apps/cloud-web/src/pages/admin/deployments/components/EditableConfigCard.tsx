import type { useUpdateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import type { LucideIcon } from 'lucide-react';
import { Pencil } from 'lucide-react';
import type React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { UpdateDeploymentData } from '@/schemas/admin/deployments';

// Generic over the form-value shape so each component page can bind its own subset of fields; the
// transform always maps back to the shared { id, data } update payload.
interface EditableConfigCardProps<T extends FieldValues> {
  title: string;
  description?: string;
  icon: LucideIcon;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  form: UseFormReturn<T>;
  mutation: ReturnType<typeof useUpdateDeployment>;
  transformSubmit?: (data: T) => { id: string; data: UpdateDeploymentData };
  // Read-only content shown when not editing.
  view: React.ReactNode;
  // The form fields — rendered as DIRECT children of <Form> so they bind (see configFields note).
  children: React.ReactNode;
}

// A config card that flips between a read view and an inline edit form. The "Edit" button lives in
// the header; Save/Cancel sit under the fields. Replaces the old monolithic edit dialog.
export function EditableConfigCard<T extends FieldValues>({
  title,
  description,
  icon: Icon,
  editing,
  onEdit,
  onCancel,
  form,
  mutation,
  transformSubmit,
  view,
  children,
}: EditableConfigCardProps<T>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={onEdit} startAdornment={<Pencil className="size-4" />}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <Form
            form={form}
            mutation={mutation}
            resetOnSuccess={false}
            onCancel={onCancel}
            transformSubmit={transformSubmit}
          >
            <div className="space-y-4">{children}</div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" data-cancel>
                Cancel
              </Button>
              <Button type="submit" loadingText="Saving...">
                Save Changes
              </Button>
            </div>
          </Form>
        ) : (
          view
        )}
      </CardContent>
    </Card>
  );
}
