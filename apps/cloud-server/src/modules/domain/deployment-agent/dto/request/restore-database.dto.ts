import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

// Selects what to restore the managed database to. Provide at most one selector; omit both to restore the
// latest backup and recover to the end of the WAL archive.
export class RestoreDatabaseDto {
  @ApiPropertyOptional({
    description: 'RFC3339 instant for point-in-time recovery',
    example: '2026-07-31T12:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  targetTime?: string;

  @ApiPropertyOptional({ description: 'pgBackRest backup label to restore', example: '20260731-120000F' })
  @IsOptional()
  @IsString()
  setLabel?: string;
}
