import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
