export interface ValidatedRow {
  index: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

export interface ValidateImportResponse {
  rows: ValidatedRow[];
  summary: { total: number; valid: number; invalid: number };
}
