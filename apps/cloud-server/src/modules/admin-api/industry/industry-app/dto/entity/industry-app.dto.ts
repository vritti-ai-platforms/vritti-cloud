import { ApiProperty } from '@nestjs/swagger';
import type { IndustryApp } from '@/db/schema';

export class IndustryAppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  industryId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appId: string;

  @ApiProperty({ example: 'crm' })
  appCode: string;

  @ApiProperty({ example: 'CRM' })
  appName: string;

  @ApiProperty({ example: true })
  isRecommended: boolean;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Creates an IndustryAppDto from an industry-app row with app details
  static from(industryApp: IndustryApp, appCode: string, appName: string): IndustryAppDto {
    const dto = new IndustryAppDto();
    dto.id = industryApp.id;
    dto.industryId = industryApp.industryId;
    dto.appId = industryApp.appId;
    dto.appCode = appCode;
    dto.appName = appName;
    dto.isRecommended = industryApp.isRecommended;
    dto.sortOrder = industryApp.sortOrder;
    return dto;
  }
}
