// US phone numbers (NANP): shown as +1 (860) 555-1234, stored as +18605551234.

/** The digits, without the leading 1 of an 11-digit +1 number. */
export function usPhoneDigits(raw: string | null | undefined): string {
  const d = (raw ?? '').replace(/\D/g, '');
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
}

/** For display. A value that isn't a US number is shown as stored. */
export function formatUSPhone(raw: string | null | undefined): string {
  const d = usPhoneDigits(raw);
  return d.length === 10 ? `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : (raw ?? '');
}

/** For an input, as the person types: +1 (860) 555-1234. */
export function formatUSPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, '');
  // The "1" of a +1 already in the field (or typed as 1-860-…) is the country code, not a digit of the number.
  if (raw.trim().startsWith('+1') || (d.length === 11 && d.startsWith('1'))) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';
  if (d.length < 4) return `+1 (${d}`;
  if (d.length < 7) return `+1 (${d.slice(0, 3)}) ${d.slice(3)}`;
  return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** What to save: +1 and the 10 digits, null when empty, anything else as typed (never guessed). */
export function usPhoneForSave(raw: string | null | undefined): string | null {
  const d = usPhoneDigits(raw);
  if (!d) return null;
  return d.length === 10 ? `+1${d}` : (raw ?? '').trim();
}
