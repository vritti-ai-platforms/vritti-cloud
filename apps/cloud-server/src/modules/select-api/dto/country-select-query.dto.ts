import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class CountrySelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
