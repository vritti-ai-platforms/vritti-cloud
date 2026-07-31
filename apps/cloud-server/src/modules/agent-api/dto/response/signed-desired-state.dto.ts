import { ApiProperty } from '@nestjs/swagger';
import { DesiredStateDto } from '../entity/desired-state.dto';

// Desired-state wrapped with cloud's Ed25519 signature over the canonical payload bytes (matches cloudapi.SignedDesiredState)
export class SignedDesiredStateDto {
  @ApiProperty({ type: DesiredStateDto })
  payload: DesiredStateDto;

  @ApiProperty({ description: 'Canonical JSON string the signature is computed over' })
  payloadB64: string;

  @ApiProperty({ description: 'Base64 Ed25519 signature by the deployment key (Keypair B)' })
  signature: string;
}
