import { ApiProperty } from '@nestjs/swagger';
import type { DeploymentSecretProvider } from '@/db/schema';

export class SecretProviderAuthDto {
  @ApiProperty({ example: 'universal' })
  method: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Non-secret auth params' })
  params: Record<string, string>;
}

export class SecretProviderDto {
  @ApiProperty({ example: 'infisical' })
  type: string;

  @ApiProperty({ example: 'https://infisical.vrittiai.com' })
  url: string;

  @ApiProperty({ example: 'e0bae9e7-…' })
  projectId: string;

  @ApiProperty({ example: 'apw1' })
  env: string;

  @ApiProperty({ type: SecretProviderAuthDto })
  auth: SecretProviderAuthDto;

  // Maps the stored non-secret secret-provider config to the API shape (the secret auth half is never included)
  static from(provider: DeploymentSecretProvider): SecretProviderDto {
    const dto = new SecretProviderDto();
    dto.type = provider.type;
    dto.url = provider.url;
    dto.projectId = provider.projectId;
    dto.env = provider.env;
    dto.auth = { method: provider.auth.method, params: provider.auth.params };
    return dto;
  }
}
