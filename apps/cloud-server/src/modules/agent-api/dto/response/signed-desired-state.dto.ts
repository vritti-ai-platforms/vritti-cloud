import { ApiProperty } from '@nestjs/swagger';

// Desired-state wrapped with cloud's Ed25519 signature over the canonical payload bytes (matches cloudapi.SignedDesiredState)
// The agent verifies the signature over payloadB64 and unmarshals THOSE bytes — no separate payload object is sent.
export class SignedDesiredStateDto {
  @ApiProperty({
    description: 'Canonical JSON of the full DesiredState — the exact bytes the signature is computed over',
  })
  payloadB64: string;

  @ApiProperty({
    description: 'Base64 Ed25519 signature by the deployment key (Keypair B) over Buffer.from(payloadB64)',
  })
  signature: string;
}
