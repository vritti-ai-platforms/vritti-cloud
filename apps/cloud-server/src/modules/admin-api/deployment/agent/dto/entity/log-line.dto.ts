import { ApiProperty } from '@nestjs/swagger';

// One tailed container log line relayed to the browser over the logs SSE stream.
export class LogLineDto {
  @ApiProperty({ description: 'Container the line is from: "agent" or a service name', example: 'core-server' })
  target: string;

  @ApiProperty({ enum: ['stdout', 'stderr'], example: 'stdout' })
  stream: string;

  @ApiProperty({ description: 'RFC3339 timestamp from the docker log stream', example: '2026-08-05T12:00:00.123Z' })
  ts: string;

  @ApiProperty({ example: 'Nest application successfully started' })
  line: string;
}
