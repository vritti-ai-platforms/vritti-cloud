import { useUpdatePlan } from '@hooks/admin/versions/businesses/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { RichTextEditor } from '@vritti/quantum-ui/RichTextEditor';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { Plan } from '@/schemas/admin/plans';

// Returns undefined if value is falsy or not valid JSON
function safeParse(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

// Form-field adapter for RichTextEditor — the field value is the serialized JSON string. Lexical fires an
// initial change on mount, which is skipped so opening the editor doesn't dirty the form.
const PlanContentField = ({
  value,
  onChange,
  editing,
}: {
  name?: string;
  value?: string;
  onChange?: (next: string) => void;
  editing: boolean;
}) => {
  const initialized = useRef(false);
  return (
    <RichTextEditor
      editorSerializedState={safeParse(value)}
      onSerializedChange={(state) => {
        if (!initialized.current) {
          initialized.current = true;
          return;
        }
        onChange?.(JSON.stringify(state));
      }}
      contentOnly={!editing}
      placeholder="Add plan features, inclusions, and details..."
      className="border-0 shadow-none bg-muted/30 min-h-100"
    />
  );
};

// Inline rich-text editor for plan content — the quantum Form owns dirty tracking, submit, and reset
export const ContentTab = ({ plan }: { plan: Plan }) => {
  const { versionId, businessId } = useVersionContext();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<{ content: string }>({ defaultValues: { content: plan.content ?? '' } });
  // Re-baseline the form to what was just saved, then drop back to view mode
  const updateMutation = useUpdatePlan(versionId, businessId, {
    onSuccess: () => {
      form.reset(form.getValues());
      setIsEditing(false);
    },
  });

  return (
    <div className="pt-4">
      <Card>
        <Form
          form={form}
          mutation={updateMutation}
          resetOnSuccess={false}
          onCancel={() => setIsEditing(false)}
          transformSubmit={(data: { content: string }) => ({ id: plan.id, data: { content: data.content } })}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Plan Content</CardTitle>
              <CardDescription>Shown to users when selecting a plan.</CardDescription>
            </div>
            {isEditing ? (
              <div className="flex gap-2 shrink-0">
                {/* data-cancel — the Form resets the field to the last saved content before onCancel fires */}
                <Button type="button" variant="outline" size="sm" data-cancel>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
                  Save
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Keyed by mode so the (uncontrolled) editor re-reads the field value on enter/exit */}
            <PlanContentField key={isEditing ? 'edit' : 'view'} name="content" editing={isEditing} />
          </CardContent>
        </Form>
      </Card>
    </div>
  );
};
