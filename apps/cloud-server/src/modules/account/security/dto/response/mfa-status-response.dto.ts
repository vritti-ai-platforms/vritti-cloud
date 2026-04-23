import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MfaMethod } from '@/db/schema';

export class MfaStatusResponseDto {
  @ApiProperty({
    description: 'Indicates whether multi-factor authentication is enabled for the user',
    example: true,
  })
  isEnabled: boolean;

  @ApiProperty({
    description: 'The active MFA methods configured by the user',
    example: ['TOTP'],
    enum: ['TOTP', 'PASSKEY'],
    isArray: true,
  })
  methods: MfaMethod[];

  @ApiProperty({
    description: 'Number of unused backup codes remaining for account recovery',
    example: 8,
  })
  backupCodesRemaining: number;

  @ApiPropertyOptional({
    description: 'List of registered passkeys with their IDs and creation dates',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        credentialId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    nullable: true,
  })
  passkeys: PasskeyInfoDto[] | null;

  @ApiPropertyOptional({
    description: 'Timestamp when MFA was last used for authentication',
    example: '2026-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  lastUsedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when MFA was initially configured',
    example: '2026-01-01T08:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  createdAt: Date | null;

  constructor(partial: Partial<MfaStatusResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PasskeyInfoDto {
  @ApiProperty({ description: 'MFA record ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'WebAuthn credential ID', example: 'base64url-credential-id' })
  credentialId: string;

  @ApiProperty({ description: 'When the passkey was registered', type: String, format: 'date-time' })
  createdAt: Date;

  constructor(partial: Partial<PasskeyInfoDto>) {
    Object.assign(this, partial);
  }
}
