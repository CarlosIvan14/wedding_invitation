import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasValidSession } from '../_lib/admin-session.js';
import { getRsvps } from '../_lib/database.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Método no permitido.' });
  if (!hasValidSession(request)) return response.status(401).json({ error: 'No autorizado.' });

  try {
    const rsvps = await getRsvps();
    const attending = rsvps.filter((rsvp) => rsvp.attendance === 'si');
    return response.status(200).json({
      rsvps,
      summary: {
        responses: rsvps.length,
        attending: attending.length,
        declining: rsvps.length - attending.length,
        guests: attending.reduce((total, rsvp) => total + rsvp.guests, 0),
      },
    });
  } catch (error) {
    console.error('Admin RSVP error:', error);
    return response.status(503).json({ error: 'No se pudo consultar la base de datos.' });
  }
}
