import { ApiProperty } from '@nestjs/swagger';

export class BackupCodesResponseDto {
  @ApiProperty({
    description: 'Indicates whether the operation completed successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable result message',
    example: 'Multi-factor authentication has been enabled successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Array of one-time use backup codes for account recovery',
    example: ['ABC123DE', 'FGH456IJ', 'KLM789NO', 'PQR012ST', 'UVW345XY'],
    type: [String],
  })
  backupCodes: string[];

  @ApiProperty({
    description: 'Warning about storing backup codes securely',
    example: 'Save these backup codes in a secure location. Each code can only be used once and they will not be shown again.',
  })
  warning: string;

  constructor(partial: Partial<BackupCodesResponseDto>) {
    Object.assign(this, partial);
  }
}
