import { ApiProperty } from '@nestjs/swagger';

// One-time enroll token for connecting an agent to a managed deployment (plaintext shown once)
export class EnrollTokenDto {
  @ApiProperty({ description: 'One-time enroll token — paste into the agent; shown only once' })
  token: string;

  @ApiProperty({ type: 'string', format: 'date-time', description: 'When the token expires' })
  expiresAt: Date;

  @ApiProperty({ description: 'Deployment public key (base64 raw 32-byte Ed25519, Keypair B) for the connect step' })
  deploymentPubKey: string;
}
