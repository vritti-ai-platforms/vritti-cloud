import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { RichTextEditor } from '@vritti/quantum-ui/RichTextEditor';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Plan } from '@/schemas/admin/plans';
import { type UpdatePlanData, updatePlanSchema } from '@/schemas/admin/plans';

// Returns undefined if value is falsy or not valid JSON
function safeParse(value: string | null | undefined) {
  if (!value) return undefined;
  try { return JSON.parse(value); } catch { return undefined; }
}

interface EditPlanFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanForm: React.FC<EditPlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const [mounted, setMounted] = useState(false);
  const contentInitialized = useRef(false);
  useEffect(() => { setMounted(true); }, []);

  const form = useForm<UpdatePlanData>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: { name: plan.name, code: plan.code, content: plan.content ?? undefined },
  });

  const content = form.watch('content');

  const updateMutation = useUpdatePlan({
    onSuccess: () => {
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={updateMutation} showRootError transformSubmit={(data) => ({ id: plan.id, data })}>
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" description="Unique code identifier for this plan" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium leading-none">Plan Content</label>
        <p className="text-sm text-muted-foreground">
          Describe features, inclusions, and benefits. Shown to users when selecting a plan.
        </p>
        {mounted && (
          <RichTextEditor
            editorSerializedState={safeParse(content)}
            onSerializedChange={(state) => {
              if (!contentInitialized.current) {
                contentInitialized.current = true;
                return;
              }
              form.setValue('content', JSON.stringify(state));
            }}
            placeholder="Add plan features, inclusions, and details..."
          />
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
