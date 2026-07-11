import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRoleTemplateDto } from './create-role-template.dto';

// code is immutable — it's the durable link to provisioned org roles; scope is immutable — grants are scope-bound
export class UpdateRoleTemplateDto extends PartialType(OmitType(CreateRoleTemplateDto, ['code', 'scope'] as const)) {}
