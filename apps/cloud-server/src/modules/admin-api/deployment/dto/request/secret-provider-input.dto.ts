import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

export class SecretProviderAuthInputDto {
  @ApiProperty({
    description: 'Auth method the agent uses to reach the secret store',
    example: 'universal',
  })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  method: string;

  @ApiProperty({
    description: 'Non-secret auth params (the secret half is submitted via secretProviderSecrets)',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { clientId: '7f3c…' },
  })
  @IsObject()
  @Type(() => Object)
  params: Record<string, string>;
}

export class SecretProviderInputDto {
  @ApiProperty({ description: 'Secret-store type', example: 'infisical' })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  type: string;

  @ApiProperty({ description: 'Secret-store base URL', example: 'https://infisical.vrittiai.com' })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  url: string;

  @ApiProperty({ description: 'Secret-store project identifier', example: 'e0bae9e7-…' })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  projectId: string;

  @ApiProperty({ description: 'Secret-store environment slug', example: 'apw1' })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  env: string;

  @ApiProperty({ type: SecretProviderAuthInputDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SecretProviderAuthInputDto)
  auth: SecretProviderAuthInputDto;
}
