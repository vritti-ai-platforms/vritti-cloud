import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeploymentSpec } from '@/db/schema';
import { SecretProviderDto } from './secret-provider.dto';

// The core stack component
export class SpecCoreDto {
  @ApiProperty({ example: true })
  enabled: boolean;
}

// pgBackRest backup config on the managed database
export class SpecDatabaseBackupDto {
  @ApiProperty({ example: 4 })
  retention: number;
}

// The database component
export class SpecDatabaseDto {
  @ApiProperty({ enum: ['managed', 'external'], example: 'managed' })
  mode: 'managed' | 'external';

  @ApiPropertyOptional({ type: SpecDatabaseBackupDto })
  backup?: SpecDatabaseBackupDto;
}

// The HTTP edge component
export class SpecEdgeDto {
  @ApiProperty({ enum: ['managed', 'external'], example: 'managed' })
  mode: 'managed' | 'external';

  @ApiPropertyOptional({ example: 'ops@vrittiai.com' })
  acmeEmail?: string;
}

// The Gitea component
export class SpecGiteaDto {
  @ApiProperty({ example: false })
  enabled: boolean;
}

// The stack composition; absent components are omitted
export class DeploymentSpecComponentsDto {
  @ApiPropertyOptional({ type: SpecCoreDto })
  core?: SpecCoreDto;

  @ApiPropertyOptional({ type: SpecDatabaseDto })
  database?: SpecDatabaseDto;

  @ApiPropertyOptional({ type: SpecEdgeDto })
  edge?: SpecEdgeDto;

  @ApiPropertyOptional({ type: SpecGiteaDto })
  gitea?: SpecGiteaDto;

  @ApiPropertyOptional({
    type: SecretProviderDto,
    description: 'Non-secret secret-store config; the secret auth half is never returned',
  })
  secretStore?: SecretProviderDto;
}

// The typed spec document surfaced to the admin console (secret-store secret half is never included)
export class DeploymentSpecDto {
  @ApiProperty({ example: 1 })
  specVersion: number;

  @ApiProperty({ type: DeploymentSpecComponentsDto })
  components: DeploymentSpecComponentsDto;

  // Maps the stored spec to the API shape — secretStore carries only its non-secret config
  static from(spec: DeploymentSpec): DeploymentSpecDto {
    const dto = new DeploymentSpecDto();
    dto.specVersion = spec.specVersion;
    const components = spec.components;
    dto.components = {
      ...(components.core ? { core: { enabled: components.core.enabled } } : {}),
      ...(components.database
        ? {
            database: {
              mode: components.database.mode,
              ...(components.database.backup ? { backup: { retention: components.database.backup.retention } } : {}),
            },
          }
        : {}),
      ...(components.edge
        ? {
            edge: {
              mode: components.edge.mode,
              ...(components.edge.acmeEmail ? { acmeEmail: components.edge.acmeEmail } : {}),
            },
          }
        : {}),
      ...(components.gitea ? { gitea: { enabled: components.gitea.enabled } } : {}),
      ...(components.secretStore ? { secretStore: SecretProviderDto.from(components.secretStore) } : {}),
    };
    return dto;
  }
}
