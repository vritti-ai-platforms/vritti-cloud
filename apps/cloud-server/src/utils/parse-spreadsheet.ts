import { BadRequestException } from '@vritti/api-sdk';
import { read, utils } from 'xlsx';

// Parses a CSV or Excel buffer into rows of key-value pairs
export function parseSpreadsheet(buffer: Buffer): Record<string, string>[] {
  const wb = read(buffer, { dense: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new BadRequestException('Spreadsheet is empty.');
  const rows = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
  if (rows.length === 0) throw new BadRequestException('No data rows found.');
  return rows;
}
