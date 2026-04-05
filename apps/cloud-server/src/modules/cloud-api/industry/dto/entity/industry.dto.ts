import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Industry } from '@/db/schema';

export class CloudIndustryDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string | null;

  static from(industry: Industry): CloudIndustryDto {
    const dto = new CloudIndustryDto();
    dto.id = industry.id;
    dto.name = industry.name;
    dto.description = industry.description ?? null;
    return dto;
  }
}
