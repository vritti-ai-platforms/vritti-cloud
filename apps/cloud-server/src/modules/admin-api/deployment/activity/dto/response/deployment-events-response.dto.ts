import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentEventDto } from '../entity/deployment-event.dto';

// A newest-first page of a deployment's event timeline plus the cursor for the next (older) page
export class DeploymentEventsResponseDto {
  @ApiProperty({ type: [DeploymentEventDto] })
  result: DeploymentEventDto[];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Opaque cursor for the next (older) page; null when there are no more events',
  })
  nextCursor: string | null;
}
