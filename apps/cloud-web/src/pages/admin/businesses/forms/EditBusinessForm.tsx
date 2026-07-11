import { useUpdateBusiness } from '@hooks/admin/businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Business, VocabularyFormData, VocabularyKey } from '@/schemas/admin/businesses';
import {
  cleanVocabulary,
  type UpdateBusinessFormData,
  updateBusinessSchema,
  VOCABULARY_DEFAULTS,
  VOCABULARY_KEYS,
  VOCABULARY_LABELS,
} from '@/schemas/admin/businesses';

interface EditBusinessFormProps {
  business: Business;
  onSuccess: () => void;
  onCancel: () => void;
}

function vocabularyDefaults(business: Business): VocabularyFormData {
  const out = {} as VocabularyFormData;
  for (const key of VOCABULARY_KEYS) {
    out[key] = {
      singular: business.vocabulary?.[key]?.singular ?? '',
      plural: business.vocabulary?.[key]?.plural ?? '',
    };
  }
  return out;
}

const VocabularyRow: React.FC<{ vocabularyKey: VocabularyKey }> = ({ vocabularyKey }) => (
  <div className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3">
    <span className="text-sm text-muted-foreground">{VOCABULARY_LABELS[vocabularyKey]}</span>
    <TextField
      name={`vocabulary.${vocabularyKey}.singular`}
      label=""
      placeholder={VOCABULARY_DEFAULTS[vocabularyKey].singular}
    />
    <TextField
      name={`vocabulary.${vocabularyKey}.plural`}
      label=""
      placeholder={VOCABULARY_DEFAULTS[vocabularyKey].plural}
    />
  </div>
);

export const EditBusinessForm: React.FC<EditBusinessFormProps> = ({ business, onSuccess, onCancel }) => {
  const form = useForm<UpdateBusinessFormData>({
    resolver: zodResolver(updateBusinessSchema),
    defaultValues: {
      name: business.name,
      code: business.code,
      description: business.description ?? '',
      vocabulary: vocabularyDefaults(business),
    },
  });

  const updateMutation = useUpdateBusiness({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: business.id,
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          vocabulary: data.vocabulary ? cleanVocabulary(data.vocabulary) : undefined,
        },
      })}
    >
      <TextField name="name" label="Business Name" placeholder="e.g. Healthcare" />
      <TextField name="code" label="Code" placeholder="e.g. HLTH" />
      <TextField
        name="description"
        label="Description (Optional)"
        placeholder="e.g. Hospitals, clinics, and medical services"
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Vocabulary</p>
          <p className="text-xs text-muted-foreground">
            Override what this business calls its structure. Leave blank to keep the default word.
          </p>
        </div>
        <div className="grid grid-cols-[7rem_1fr_1fr] gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span />
          <span>Singular</span>
          <span>Plural</span>
        </div>
        {VOCABULARY_KEYS.map((key) => (
          <VocabularyRow key={key} vocabularyKey={key} />
        ))}
      </div>

      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
