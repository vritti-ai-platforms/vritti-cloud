import type { TaxRegime } from '@/db/schema';

// GSTIN format: 2-digit state code + 10-char PAN + entity digit + 'Z' + checksum char (15 total)
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GSTIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// UAE TRN format: 15 numeric digits
const TRN_REGEX = /^[0-9]{15}$/;

// Validates a GSTIN string including its mod-36 checksum digit
export function isValidGstin(value: string): boolean {
  const gstin = value.trim().toUpperCase();
  if (!GSTIN_REGEX.test(gstin)) return false;
  let factor = 2;
  let sum = 0;
  const mod = GSTIN_ALPHABET.length;
  for (let i = gstin.length - 2; i >= 0; i--) {
    const code = GSTIN_ALPHABET.indexOf(gstin[i]);
    let digit = factor * code;
    digit = Math.floor(digit / mod) + (digit % mod);
    sum += digit;
    factor = factor === 2 ? 1 : 2;
  }
  const checkCode = (mod - (sum % mod)) % mod;
  return GSTIN_ALPHABET[checkCode] === gstin[gstin.length - 1];
}

// Validates a UAE TRN string (15 numeric digits)
export function isValidTrn(value: string): boolean {
  return TRN_REGEX.test(value.trim());
}

// Validates a tax id against the country's tax regime
export function isValidTaxId(value: string, regime: TaxRegime): boolean {
  switch (regime) {
    case 'GST':
      return isValidGstin(value);
    case 'VAT':
      return isValidTrn(value);
    default:
      return value.trim().length > 0;
  }
}
