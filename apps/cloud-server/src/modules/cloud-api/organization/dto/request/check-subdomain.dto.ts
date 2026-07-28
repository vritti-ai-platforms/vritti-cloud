import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';
import { SUBDOMAIN_MAX_LENGTH } from './create-organization.dto';

export class CheckSubdomainDto {
  // Mirrors CreateOrganizationDto.subdomain exactly — otherwise a subdomain can pass the
  // availability check and then fail creation.
  @ApiProperty({ example: 'acme-corp', maxLength: SUBDOMAIN_MAX_LENGTH })
  @IsString()
  @MaxLength(SUBDOMAIN_MAX_LENGTH)
  @Matches(/^[a-z0-9-]+$/, { message: 'Only lowercase letters, numbers, and hyphens' })
  subdomain: string;
}
