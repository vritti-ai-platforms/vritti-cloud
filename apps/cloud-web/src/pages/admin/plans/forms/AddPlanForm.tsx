import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { RichTextEditor } from '@vritti/quantum-ui/RichTextEditor';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type CreatePlanData, createPlanSchema } from '@/schemas/admin/plans';

// Returns undefined if value is falsy or not valid JSON
function safeParse(value: string | null | undefined) {
  if (!value) return undefined;
  try { return JSON.parse(value); } catch { return undefined; }
}

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess, onCancel }) => {
  const [mounted, setMounted] = useState(false);
  const contentInitialized = useRef(false);
  useEffect(() => { setMounted(true); }, []);

  const form = useForm<CreatePlanData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: '', code: '', content: undefined },
  });

  const content = form.watch('content');

  const createMutation = useCreatePlan({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
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
        <Button type="submit" loadingText="Adding...">
          Add Plan
        </Button>
      </div>
    </Form>
  );
};
