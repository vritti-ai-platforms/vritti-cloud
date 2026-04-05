import { ApiProperty } from '@nestjs/swagger';
import type { Session } from '@/db/schema';

export class SessionResponse {
  @ApiProperty({
    description: 'Unique session identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Device information parsed from user agent',
    example: 'Chrome 120 on macOS',
  })
  device: string;

  @ApiProperty({
    description: 'Geographic location based on IP address',
    example: 'Hyderabad, IN',
  })
  location: string;

  @ApiProperty({
    description: 'IP address of the session',
    example: '192.168.1.1',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2026-02-04T12:30:00Z',
  })
  lastActive: Date;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: false,
  })
  isCurrent: boolean;

  // Maps a session record to the frontend response shape
  static from(session: Session, currentAccessTokenHash: string): SessionResponse {
    return {
      sessionId: session.id,
      device: session.device || 'Unknown Device',
      location: session.location || 'Unknown',
      ipAddress: session.ipAddress || 'Unknown',
      lastActive: session.createdAt,
      isCurrent: session.accessTokenHash === currentAccessTokenHash,
    };
  }
}
