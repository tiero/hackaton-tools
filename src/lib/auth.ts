// Admin auth helpers. The admin cookie never stores the raw password — it stores
// an opaque token derived from it, and all comparisons are constant-time.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// The value stored in the admin cookie — a hash of the password, never the password.
export async function adminToken(password: string): Promise<string> {
  return sha256Hex('admin:v1:' + password);
}

// Login check: constant-time compare of the submitted password against the secret
// (over equal-length hashes, so neither length nor content leaks via timing).
export async function checkPassword(input: string, password: string | undefined): Promise<boolean> {
  if (!password) return false;
  const [a, b] = await Promise.all([sha256Hex(input), sha256Hex(password)]);
  return timingSafeEqual(a, b);
}

// Session check: does the cookie hold a valid admin token for the current secret?
export async function checkAdminCookie(cookieValue: string | undefined, password: string | undefined): Promise<boolean> {
  if (!password || !cookieValue) return false;
  return timingSafeEqual(cookieValue, await adminToken(password));
}
