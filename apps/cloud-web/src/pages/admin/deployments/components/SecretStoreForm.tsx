import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  assembleSecretProvider,
  DEFAULT_SECRET_PROVIDER,
  type Deployment,
  SECRET_AUTH_METHOD_FIELDS,
  type SecretAuthMethod,
  secretProviderSecretsField,
  secretStoreField,
  validateSecretProvider,
} from '@/schemas/admin/deployments';
import { renderSecretStoreFields } from './configFields';

// A partial-update form scoped to spec.components.secretStore + the write-only secret values. First-time
// entry requires the secrets; a rotation (existing store) lets each secret be left blank to keep it.
function buildSchema(requireSecrets: boolean) {
  return z
    .object({
      components: z.object({ secretStore: secretStoreField }),
      secretProviderSecrets: secretProviderSecretsField.optional(),
    })
    .superRefine((data, ctx) => {
      validateSecretProvider(data.components.secretStore, data.secretProviderSecrets, ctx, requireSecrets);
    });
}

type SecretStoreFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface SecretStoreFormProps {
  deployment: Deployment;
  onSuccess: () => void;
  // Renders a Cancel button (resets + calls this) — used by the rotation card on the Agent tab.
  onCancel?: () => void;
  // Renders a Back button — used by the first-time setup step.
  onBack?: () => void;
  submitLabel?: string;
}

export const SecretStoreForm: React.FC<SecretStoreFormProps> = ({
  deployment,
  onSuccess,
  onCancel,
  onBack,
  submitLabel = 'Save',
}) => {
  const existing = !!deployment.spec.components.secretStore;
  const form = useForm<SecretStoreFormValues>({
    resolver: zodResolver(buildSchema(!existing)),
    defaultValues: {
      components: { secretStore: deployment.spec.components.secretStore ?? DEFAULT_SECRET_PROVIDER },
      secretProviderSecrets: {},
    },
  });

  const authMethod = useWatch({ control: form.control, name: 'components.secretStore.auth.method' }) as
    | SecretAuthMethod
    | undefined;
  const authFields = authMethod ? (SECRET_AUTH_METHOD_FIELDS[authMethod] ?? []) : [];

  const mutation = useUpdateDeployment({ onSuccess });

  const transformSubmit = (data: SecretStoreFormValues) => {
    const { secretStore, secretProviderSecrets } = assembleSecretProvider(data);
    return { id: deployment.id, data: { components: { secretStore }, secretProviderSecrets } };
  };

  return (
    <Form form={form} mutation={mutation} resetOnSuccess={false} onCancel={onCancel} transformSubmit={transformSubmit}>
      {renderSecretStoreFields({ authFields, existing })}
      <div className="flex justify-between gap-2 pt-4">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
            Back
          </Button>
        ) : onCancel ? (
          <Button type="button" variant="outline" data-cancel>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" loadingText="Saving...">
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
};
