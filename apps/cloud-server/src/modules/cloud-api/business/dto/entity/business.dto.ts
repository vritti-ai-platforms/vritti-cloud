import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Business } from '@/db/schema';

export class CloudBusinessDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string | null;

  static from(business: Business): CloudBusinessDto {
    const dto = new CloudBusinessDto();
    dto.id = business.id;
    dto.name = business.name;
    dto.description = business.description ?? null;
    return dto;
  }
}
