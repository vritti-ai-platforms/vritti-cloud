import { ApiProperty } from '@nestjs/swagger';
import { SiteDto } from '../../../dto/entity/site.dto';
import { LeTaxRegistrationDto } from '../entity/le-tax-registration.dto';
import { LegalEntityDto } from '../entity/legal-entity.dto';
import { SiteGroupDto } from '../entity/site-group.dto';

export class StructureOrganizationDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  name: string;

  @ApiProperty({ example: 'acme-corp' })
  code: string;
}

export class StructureResponseDto {
  @ApiProperty({ type: StructureOrganizationDto })
  organization: StructureOrganizationDto;

  @ApiProperty({ type: [LegalEntityDto] })
  legalEntities: LegalEntityDto[];

  @ApiProperty({ type: [LeTaxRegistrationDto] })
  taxRegistrations: LeTaxRegistrationDto[];

  @ApiProperty({ type: [SiteDto] })
  sites: SiteDto[];

  @ApiProperty({ type: [SiteGroupDto] })
  siteGroups: SiteGroupDto[];
}
