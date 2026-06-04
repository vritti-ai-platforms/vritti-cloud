import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class IdentityVerificationStartDto {
  @ApiProperty({ description: 'Verification channel', example: 'IDENTITY_EMAIL_OUT' })
  @IsString()
  @IsNotEmpty()
  channel: string;
}

export class VerifyIdentityDto {
  @ApiProperty({ description: 'Verification channel', example: 'IDENTITY_EMAIL_OUT' })
  @IsString()
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Verification code must contain only numbers' })
  otpCode: string;
}

export class SubmitNewTargetDto {
  @ApiProperty({ description: 'Verification channel', example: 'EMAIL' })
  @IsString()
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ description: 'New email or phone number', example: 'new@example.com' })
  @IsString()
  @IsNotEmpty()
  target: string;
}

export class VerifyNewTargetDto {
  @ApiProperty({ description: 'Verification channel', example: 'EMAIL' })
  @IsString()
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Verification code must contain only numbers' })
  otpCode: string;
}

export class ResendTargetOtpDto {
  @ApiProperty({ description: 'Verification channel', example: 'EMAIL' })
  @IsString()
  @IsNotEmpty()
  channel: string;
}
