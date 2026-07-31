import { ApiProperty } from '@nestjs/swagger';

// DB provisioning mode for a deployment's Postgres (matches cloudapi.DBMode)
export const DesiredStateModeValues = {
  managed: 'managed' as const,
  external: 'external' as const,
};
export type DesiredStateMode = (typeof DesiredStateModeValues)[keyof typeof DesiredStateModeValues];

// Resolved, pinned image references for a deployment's stack (matches cloudapi.Images)
export class ImagesDto {
  @ApiProperty() coreServer: string;
  @ApiProperty() commerceService: string;
  @ApiProperty() postgres: string;
  @ApiProperty() redis: string;
  @ApiProperty() nats: string;
  @ApiProperty() gitea: string;
  @ApiProperty() nginx: string;
}

// Optional stack features toggled per deployment (matches cloudapi.AddOns)
export class AddOnsDto {
  @ApiProperty() pgBackRest: boolean;
  @ApiProperty() gitea: boolean;
  @ApiProperty() nginx: boolean;
}

// Desired running state the agent reconciles toward (matches cloudapi.DesiredState — exact JSON field names)
export class DesiredStateDto {
  @ApiProperty({ description: 'Monotonic generation; the agent skips reconcile when unchanged', example: 3 })
  generation: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ enum: DesiredStateModeValues, example: 'managed' })
  mode: DesiredStateMode;

  @ApiProperty({ example: 'apw1.vrittiai.com' })
  baseDomain: string;

  @ApiProperty({ type: ImagesDto })
  images: ImagesDto;

  @ApiProperty({ type: AddOnsDto })
  addOns: AddOnsDto;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Plaintext non-secret config' })
  config: Record<string, string>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'name → base64 sealed ciphertext (agent decrypts)',
  })
  sealedSecrets: Record<string, string>;
}
