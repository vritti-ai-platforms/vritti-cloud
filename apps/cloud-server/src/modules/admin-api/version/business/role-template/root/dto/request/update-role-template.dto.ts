import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRoleTemplateDto } from './create-role-template.dto';

// code is immutable — it's the durable link to provisioned org roles, so it can't be edited after creation
export class UpdateRoleTemplateDto extends PartialType(OmitType(CreateRoleTemplateDto, ['code'] as const)) {}
