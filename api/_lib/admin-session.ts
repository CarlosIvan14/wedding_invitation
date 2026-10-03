import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';

const SESSION_NAME = 'wedding_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_NOT_CONFIGURED');
  return secret;
}

function signature(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function passwordIsValid(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_NOT_CONFIGURED');
  if (typeof password !== 'string') return false;
  const candidate = Buffer.from(password);
  const target = Buffer.from(expected);
  return candidate.length === target.length && timingSafeEqual(candidate, target);
}

export function createSessionCookie() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString('base64url');
  const value = `${payload}.${signature(payload)}`;
  return `${SESSION_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${SESSION_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function hasValidSession(request: VercelRequest) {
  try {
    const cookie = request.headers.cookie || '';
    const session = cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${SESSION_NAME}=`))?.slice(SESSION_NAME.length + 1);
    if (!session) return false;
    const [payload, receivedSignature] = session.split('.');
    if (!payload || !receivedSignature) return false;
    const expectedSignature = signature(payload);
    const received = Buffer.from(receivedSignature);
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}
