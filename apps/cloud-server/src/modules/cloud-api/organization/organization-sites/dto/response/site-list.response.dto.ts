import { ApiProperty } from '@nestjs/swagger';
import { SiteDto } from '../../../dto/entity/site.dto';

export class SiteListResponseDto {
  @ApiProperty({ type: [SiteDto] })
  result: SiteDto[];
}
