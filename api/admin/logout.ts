import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie } from '../_lib/admin-session';

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método no permitido.' });
  response.setHeader('Set-Cookie', clearSessionCookie());
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ success: true });
}
