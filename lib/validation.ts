export function required(value: FormDataEntryValue | null, label: string, max = 2000) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} is required.`);
  if (text.length > max) throw new Error(`${label} is too long.`);
  return text;
}
export function optional(value: FormDataEntryValue | null, max = 2000) {
  const text = String(value ?? '').trim();
  if (text.length > max) throw new Error('A field is too long.');
  return text;
}
export function email(value: FormDataEntryValue | null) {
  const text = required(value, 'Email', 320);
  if (!/^\S+@\S+\.\S+$/.test(text)) throw new Error('Enter a valid email address.');
  return text;
}
export function boolean(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim().toLowerCase();
  return text === 'true' || text === 'on' || text === '1' || text === 'yes';
}
export function intRange(value: FormDataEntryValue | null, label: string, min: number, max: number, fallback: number) {
  const n = Number(value || fallback);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`);
  return n;
}
