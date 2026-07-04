import { ApiProperty } from '@nestjs/swagger';

export class SigningKeyDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  deploymentId: string;

  @ApiProperty({
    example: 'MCowBQYDK2VwAyEA0V5v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v8=',
    description: 'Ed25519 public key (base64). Shown only once — it cannot be retrieved again.',
  })
  publicKey: string;
}
