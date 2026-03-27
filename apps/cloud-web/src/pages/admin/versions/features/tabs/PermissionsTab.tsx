import { usePermissionTypes } from '@hooks/admin/enums';
import { useFeaturePermissions, useSetFeaturePermissions } from '@hooks/admin/feature-permissions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CheckboxGroup } from '@vritti/quantum-ui/CheckboxGroup';
import { Form } from '@vritti/quantum-ui/Form';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';

// Display label for a permission type
function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

const permissionsSchema = z.object({
  types: z.array(z.string()),
});

type PermissionsFormData = z.infer<typeof permissionsSchema>;

interface PermissionsTabProps {
  featureId: string;
}

export const PermissionsTab = ({ featureId }: PermissionsTabProps) => {
  const { versionId } = useVersionContext();
  const { data: enumData, isLoading: enumLoading } = usePermissionTypes();
  const { data, isLoading } = useFeaturePermissions(versionId, featureId);

  const form = useForm<PermissionsFormData>({
    resolver: zodResolver(permissionsSchema),
    values: { types: data?.types ?? [] },
  });

  const saveMutation = useSetFeaturePermissions();

  // Build checkbox options from the enum API
  const options = useMemo(
    () => (enumData?.values ?? []).map((type) => ({ value: type, label: typeLabel(type) })),
    [enumData],
  );

  if (isLoading || enumLoading) {
    return (
      <div className="pt-4">
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Types</CardTitle>
          <CardDescription>Select which actions this feature supports</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            form={form}
            mutation={saveMutation}
            showRootError
            resetOnSuccess={false}
            transformSubmit={(formData) => ({ versionId, featureId, types: formData.types })}
          >
            <CheckboxGroup name="types" options={options} columns={4} />
            <div className="flex justify-end pt-4">
              <Button type="submit" size="sm" disabled={!form.formState.isDirty} loadingText="Saving...">
                Save Permissions
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
