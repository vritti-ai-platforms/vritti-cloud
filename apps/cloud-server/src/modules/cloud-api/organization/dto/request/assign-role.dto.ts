import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'User to assign the role to', example: 'uuid-here' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Role to assign', example: 'uuid-here' })
  @IsUUID()
  roleId: string;
}
