import { createHmac, timingSafeEqual } from 'node:crypto';

// Sign-in links for client emails. A cleaner's offer lasts 24 hours and is often opened
// on a phone that never saw the password made at request time, so the email's button
// signs the client in. Stateless: the signature covers the email and the password hash,
// so changing either one (or a password reset) voids every link already sent.
const TTL_SECONDS = 72 * 60 * 60;

type Owner = { id: string; email: string; password: string | null };

function mac(o: Owner, exp: number): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return createHmac('sha256', secret)
    .update(`client-login\n${o.id}\n${exp}\n${o.email}\n${o.password ?? ''}`)
    .digest('base64url');
}

export function signLoginToken(o: Owner, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + TTL_SECONDS;
  return `${o.id}.${exp}.${mac(o, exp)}`;
}

/** Who the token claims to be for. Only a lookup key: verify before trusting it. */
export const loginTokenUserId = (token: string) => token.split('.')[0] ?? '';

export function verifyLoginToken(token: string, o: Owner, now = Date.now()): boolean {
  const [id, expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (id !== o.id || !sig || !Number.isInteger(exp) || exp * 1000 < now) return false;
  const a = Buffer.from(sig), b = Buffer.from(mac(o, exp));
  return a.length === b.length && timingSafeEqual(a, b);
}
