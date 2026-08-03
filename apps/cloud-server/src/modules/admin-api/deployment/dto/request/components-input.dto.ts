import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsObject, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { SecretProviderInputDto } from './secret-provider-input.dto';

// Component mode — managed = the agent runs it; external = something else provides it
export const ComponentModeInputValues = {
  managed: 'managed' as const,
  external: 'external' as const,
};
export type ComponentModeInput = (typeof ComponentModeInputValues)[keyof typeof ComponentModeInputValues];

// The core stack component input — the agent runs core-server/commerce/nats/redis (defaults enabled)
export class CoreComponentInputDto {
  @ApiPropertyOptional({ default: true, description: 'Whether the core stack is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

// pgBackRest backup config input — only valid when the database is managed
export class DatabaseBackupInputDto {
  @ApiProperty({ description: 'Full backups kept (repo*-retention-full)', example: 4 })
  @IsInt()
  @Min(1)
  @Max(52)
  retention: number;
}

// The database component input — managed = agent runs its own Postgres; external = agent connects to an existing DB
export class DatabaseComponentInputDto {
  @ApiProperty({ enum: ComponentModeInputValues, description: 'DB provisioning mode' })
  @IsEnum(ComponentModeInputValues)
  mode: ComponentModeInput;

  @ApiPropertyOptional({
    type: DatabaseBackupInputDto,
    description: 'pgBackRest config — only valid when mode=managed',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DatabaseBackupInputDto)
  backup?: DatabaseBackupInputDto;
}

// The HTTP edge component input — managed = agent runs its own nginx+certbot edge; external = another proxy fronts core
export class EdgeComponentInputDto {
  @ApiProperty({ enum: ComponentModeInputValues, description: 'HTTP edge mode' })
  @IsEnum(ComponentModeInputValues)
  mode: ComponentModeInput;

  @ApiPropertyOptional({
    description: "Let's Encrypt registration email — required when mode=managed",
    example: 'ops@vrittiai.com',
  })
  @IsOptional()
  @IsEmail()
  @Trim()
  acmeEmail?: string;
}

// The Gitea component input — a post-setup opt-in add-on
export class GiteaComponentInputDto {
  @ApiProperty({ description: 'Whether Gitea is enabled', example: false })
  @IsBoolean()
  enabled: boolean;
}

// Nested stack-component spec input mirroring DeploymentSpec.components — managed deployments only
export class ComponentsInputDto {
  @ApiPropertyOptional({ type: CoreComponentInputDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CoreComponentInputDto)
  core?: CoreComponentInputDto;

  @ApiPropertyOptional({ type: DatabaseComponentInputDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DatabaseComponentInputDto)
  database?: DatabaseComponentInputDto;

  @ApiPropertyOptional({ type: EdgeComponentInputDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EdgeComponentInputDto)
  edge?: EdgeComponentInputDto;

  @ApiPropertyOptional({ type: GiteaComponentInputDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GiteaComponentInputDto)
  gitea?: GiteaComponentInputDto;

  @ApiPropertyOptional({ type: SecretProviderInputDto, description: 'Non-secret secret-store config' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SecretProviderInputDto)
  secretStore?: SecretProviderInputDto;
}
