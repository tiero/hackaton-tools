// Tiny server-side validation helpers. Throw on bad input; callers catch and
// surface a friendly message.

export class ValidationError extends Error {}

export function required(value: unknown, label: string, max = 255): string {
  const v = String(value ?? '').trim();
  if (!v) throw new ValidationError(`${label} is required.`);
  if (v.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`);
  return v;
}

export function optional(value: unknown, max = 255): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  if (v.length > max) throw new ValidationError(`Value must be ${max} characters or fewer.`);
  return v;
}

export function email(value: unknown): string {
  const v = required(value, 'Email', 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) throw new ValidationError('Email does not look valid.');
  return v;
}

export function intRange(value: unknown, label: string, min: number, max: number, fallback: number): number {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(`${label} must be a whole number between ${min} and ${max}.`);
  }
  return n;
}

export function boolean(value: unknown): boolean {
  const v = String(value ?? '').toLowerCase();
  return v === 'on' || v === 'true' || v === '1' || v === 'yes';
}

export function newId(): string {
  return crypto.randomUUID();
}
