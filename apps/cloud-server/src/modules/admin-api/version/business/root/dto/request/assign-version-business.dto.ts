import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignVersionBusinessDto {
  @ApiProperty({
    description: 'Business (vertical) UUID to assign to the version',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  businessId: string;
}
