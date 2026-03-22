import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class PurchaseAddonDto {
  @ApiProperty({
    description: 'Business unit IDs to enable the addon for',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  businessUnitIds: string[];
}
