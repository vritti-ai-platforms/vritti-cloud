import { ApiProperty } from '@nestjs/swagger';
import type { OAuthProviderType } from '@/db/schema';

export class LinkedAccountDto {
  @ApiProperty({ description: 'OAuth provider type', example: 'GOOGLE', enum: ['GOOGLE', 'MICROSOFT', 'APPLE', 'FACEBOOK', 'X'] })
  provider: OAuthProviderType;

  @ApiProperty({ description: 'When the provider was linked', type: String, format: 'date-time' })
  createdAt: Date;

  constructor(partial: Partial<LinkedAccountDto>) {
    Object.assign(this, partial);
  }
}

export class LinkedAccountsResponseDto {
  @ApiProperty({ description: 'Linked OAuth providers', type: [LinkedAccountDto] })
  accounts: LinkedAccountDto[];

  @ApiProperty({ description: 'Whether the user can disconnect providers (has password or multiple providers)' })
  canDisconnect: boolean;

  constructor(partial: Partial<LinkedAccountsResponseDto>) {
    Object.assign(this, partial);
  }
}
