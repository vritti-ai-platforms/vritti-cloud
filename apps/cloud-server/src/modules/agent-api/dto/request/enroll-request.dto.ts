import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

// Agent enrollment payload — presents the one-time token plus the agent's fresh public keys (matches cloudapi.EnrollRequest)
export class EnrollRequestDto {
  @ApiProperty({ description: 'Deployment this agent manages', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  deploymentId: string;

  @ApiProperty({ description: 'One-time enroll token issued from the admin console' })
  @IsString()
  @IsNotEmpty()
  enrollToken: string;

  @ApiProperty({ description: 'Agent Ed25519 signing public key (base64 raw 32-byte) — authenticates agent→cloud' })
  @IsString()
  @IsNotEmpty()
  signingPubKey: string;

  @ApiPropertyOptional({
    description: 'Agent X25519 sealing public key (base64 raw 32-byte) — operator secrets seal target',
  })
  @IsOptional()
  @IsString()
  sealingPubKey?: string;

  @ApiPropertyOptional({ description: 'Reported agent version', example: '0.1.0' })
  @IsOptional()
  @IsString()
  agentVersion?: string;
}
