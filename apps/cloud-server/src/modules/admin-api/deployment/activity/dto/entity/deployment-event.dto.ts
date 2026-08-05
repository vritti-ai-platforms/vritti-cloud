import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeploymentEvent } from '@/db/schema';

// One timeline event surfaced to the admin console
export class DeploymentEventDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Desired-state generation the event was recorded against',
    example: 3,
  })
  generation: number | null;

  @ApiProperty({ enum: ['info', 'warn', 'error'], example: 'info' })
  level: string;

  @ApiPropertyOptional({ nullable: true, example: 'edge', description: 'Component the event relates to' })
  component: string | null;

  @ApiProperty({ example: 'CertIssued' })
  reason: string;

  @ApiProperty({ example: 'Wildcard certificate issued for *.apw1.vrittiai.com.' })
  message: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  // Maps an event row to the API shape
  static from(event: DeploymentEvent): DeploymentEventDto {
    const dto = new DeploymentEventDto();
    dto.id = event.id;
    dto.generation = event.generation;
    dto.level = event.level;
    dto.component = event.component;
    dto.reason = event.reason;
    dto.message = event.message;
    dto.createdAt = event.createdAt;
    return dto;
  }
}
