import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export interface ValidatedRow {
  index: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

export interface ValidateImportResult {
  rows: ValidatedRow[];
  summary: { total: number; valid: number; invalid: number };
}

// Validates parsed spreadsheet rows against a DTO class
export async function validateImportRows<T extends object>(
  rows: Record<string, string>[],
  DtoClass: new () => T,
  inject?: Record<string, unknown>,
): Promise<ValidateImportResult> {
  const validatedRows: ValidatedRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const instance = plainToInstance(DtoClass, { ...row, ...inject });
    const validationErrors = await validate(instance as object);

    const errors = validationErrors.flatMap((e) => Object.values(e.constraints ?? {}));

    validatedRows.push({
      index: i + 1,
      data: row,
      valid: errors.length === 0,
      errors,
    });
  }

  const valid = validatedRows.filter((r) => r.valid).length;
  return {
    rows: validatedRows,
    summary: { total: rows.length, valid, invalid: rows.length - valid },
  };
}
