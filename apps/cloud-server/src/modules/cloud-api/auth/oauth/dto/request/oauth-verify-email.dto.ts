import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class OAuthVerifyEmailDto {
  @ApiProperty({
    description: 'Six-digit one-time password sent to the account email to confirm ownership before linking',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  code: string;
}
