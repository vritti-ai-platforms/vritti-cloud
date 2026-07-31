import { ApiProperty } from '@nestjs/swagger';

// Enrollment result — the bearer credential plus the deployment public key and a signed connectivity nonce (matches cloudapi.EnrollResponse)
export class EnrollResponseDto {
  @ApiProperty({ description: 'Long-lived bearer credential sent on every subsequent request' })
  agentCredential: string;

  @ApiProperty({
    description: 'Deployment public key — base64 raw 32-byte Ed25519 (Keypair B), used to verify cloud signatures',
  })
  deploymentPubKey: string;

  @ApiProperty({ description: 'Random challenge string for the connectivity test' })
  nonce: string;

  @ApiProperty({ description: 'Nonce signed by the deployment private key (Keypair B)' })
  nonceSignature: string;
}
