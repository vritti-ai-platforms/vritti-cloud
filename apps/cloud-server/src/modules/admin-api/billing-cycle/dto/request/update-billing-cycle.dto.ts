import { PartialType } from '@nestjs/swagger';
import { CreateBillingCycleDto } from './create-billing-cycle.dto';

export class UpdateBillingCycleDto extends PartialType(CreateBillingCycleDto) {}
