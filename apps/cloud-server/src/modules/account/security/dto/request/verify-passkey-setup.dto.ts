import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';
import type { RegistrationResponseJSON } from '@domain/mfa/types/webauthn.types';

export class VerifyPasskeySetupDto {
  @ApiProperty({
    description: 'WebAuthn RegistrationResponseJSON from the browser credentials API',
    example: {
      id: 'base64url-credential-id',
      rawId: 'base64url-raw-id',
      type: 'public-key',
      response: {
        clientDataJSON: 'base64url-encoded',
        attestationObject: 'base64url-encoded',
      },
    },
  })
  @IsObject()
  @IsNotEmpty()
  credential: RegistrationResponseJSON;
}
