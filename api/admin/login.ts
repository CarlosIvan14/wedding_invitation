import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionCookie, passwordIsValid } from '../_lib/admin-session.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método no permitido.' });

  try {
    if (!passwordIsValid(request.body?.password)) {
      return response.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    response.setHeader('Set-Cookie', createSessionCookie());
    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return response.status(503).json({ error: 'El acceso privado aún no está configurado.' });
  }
}
