import { ApiProperty } from '@nestjs/swagger';

export class OAuthVerifyEmailResponseDto {
  @ApiProperty({
    description: 'Indicates whether the email was verified and the provider linked successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable result message',
    example: 'Your email has been verified and your account is now linked.',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the user must still complete onboarding before accessing the dashboard',
    example: false,
  })
  requiresOnboarding: boolean;

  constructor(partial: Partial<OAuthVerifyEmailResponseDto>) {
    Object.assign(this, partial);
  }
}
