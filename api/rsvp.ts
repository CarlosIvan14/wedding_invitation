import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRsvp } from './_lib/database.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name: rawName, guests: rawGuests, attendance } = request.body || {};
    const name = typeof rawName === 'string' ? rawName.trim().replace(/\s+/g, ' ') : '';
    const guests = Number(rawGuests);

    if (name.length < 2 || name.length > 120 || !Number.isInteger(guests) || guests < 1 || guests > 12 || !['si', 'no'].includes(attendance)) {
      return response.status(400).json({ error: 'Revisa los datos de tu confirmación.' });
    }

    const willAttend = attendance === 'si';
    const guestText = guests === 1 ? '1 persona' : `${guests} personas`;
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));
    const safeName = escapeHtml(name);

    const savedRsvp = await createRsvp({ name, guests, attendance });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body style="font-family: Georgia, serif; line-height: 1.6; color: #2b2c28; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="border: 1px solid #a27d45; border-radius: 12px; padding: 32px; background: #f4efeb;">
            <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; color: #455545; margin: 0 0 16px; font-size: 28px;">
              Nueva confirmación de asistencia
            </h1>
            <p style="margin: 0 0 24px; color: #8ca18c; font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em;">
              Boda & Bautizo · 14 Noviembre 2026
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; font-weight: 600; color: #455545; width: 140px;">Nombre:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; color: #2b2c28;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; font-weight: 600; color: #455545;">Acompañantes:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; color: #2b2c28;">${guestText}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #455545;">Asistencia:</td>
                <td style="padding: 12px 0; color: ${willAttend ? '#8ca18c' : '#a27d45'}; font-weight: 600;">
                  ${willAttend ? '✓ Con alegría, asistiré' : '✗ Con cariño, no podré asistir'}
                </td>
              </tr>
            </table>
            <p style="margin: 24px 0 0; font-size: 14px; color: #8ca18c;">
              Enviado desde la invitación web de Candy & Agustín
            </p>
          </div>
        </body>
      </html>
    `;

    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: 'Invitación Candy & Agustín <onboarding@resend.dev>',
        to: ['carlosivanarmenta8@gmail.com'],
        subject: `RSVP: ${name} — ${willAttend ? 'Asiste' : 'No asiste'} (${guestText})`,
        html,
      });
      if (error) console.error('Resend error:', error);
    }

    return response.status(200).json({ success: true, id: savedRsvp.id });
  } catch (err) {
    console.error('RSVP API error:', err);
    const message = err instanceof Error && err.message === 'DATABASE_NOT_CONFIGURED'
      ? 'El registro de confirmaciones aún se está configurando. Intenta nuevamente en unos minutos.'
      : 'No se pudo guardar tu confirmación. Intenta de nuevo.';
    return response.status(503).json({ error: message });
  }
}
