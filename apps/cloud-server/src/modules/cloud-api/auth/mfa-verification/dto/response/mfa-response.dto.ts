import { ApiProperty } from '@nestjs/swagger';

class MfaVerificationUserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'usr_abc123def456',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the authenticated user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'John',
  })
  displayName: string;
}

export class MfaVerificationResponseDto {
  @ApiProperty({
    description: 'JWT access token for authenticating subsequent API requests',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Information about the authenticated user',
    type: MfaVerificationUserDto,
  })
  user: MfaVerificationUserDto;

  constructor(partial: Partial<MfaVerificationResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PasskeyMfaOptionsDto<T = unknown> {
  @ApiProperty({
    description:
      'WebAuthn authentication options to be passed to the browser credentials API (navigator.credentials.get)',
    example: {
      challenge: 'base64-encoded-challenge-string',
      timeout: 60000,
      rpId: 'example.com',
      allowCredentials: [
        {
          type: 'public-key',
          id: 'base64-encoded-credential-id',
        },
      ],
      userVerification: 'preferred',
    },
  })
  options: T;

  constructor(options: T) {
    this.options = options;
  }
}

export class SmsOtpSentResponseDto {
  @ApiProperty({
    description: 'Indicates whether the SMS OTP was sent successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable message about the SMS OTP status',
    example: 'Verification code sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Masked phone number where the OTP was sent',
    example: '+1******7890',
  })
  maskedPhone: string;

  constructor(partial: Partial<SmsOtpSentResponseDto>) {
    Object.assign(this, partial);
  }
}
