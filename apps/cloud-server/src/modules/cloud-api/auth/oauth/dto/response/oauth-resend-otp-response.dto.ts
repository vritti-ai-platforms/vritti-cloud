import { ApiProperty } from '@nestjs/swagger';

export class OAuthResendOtpResponseDto {
  @ApiProperty({
    description: 'Indicates whether a new verification code was sent',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable result message',
    example: 'A new verification code has been sent to your email.',
  })
  message: string;

  constructor(partial: Partial<OAuthResendOtpResponseDto>) {
    Object.assign(this, partial);
  }
}
