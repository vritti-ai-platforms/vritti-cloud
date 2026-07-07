import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeploymentFilterDto {
  @ApiProperty({ description: 'Region UUID to filter deployments', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  regionId: string;

  @ApiProperty({
    description: 'Cloud provider UUID to filter deployments',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  cloudProviderId: string;

  @ApiProperty({ description: 'Business UUID to filter deployments', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  businessId: string;
}

export class DeploymentPlanQueryDto {
  @ApiProperty({ description: 'Business UUID to filter plans', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  businessId: string;

  @ApiProperty({
    description: 'Country UUID to resolve plan pricing',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;
}
