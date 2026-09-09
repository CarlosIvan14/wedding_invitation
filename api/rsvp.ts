import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, guests, attendance } = await request.json();

    if (!name || !guests || !attendance) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const willAttend = attendance === 'si';
    const guestText = guests === '1' ? '1 persona' : `${guests} personas`;

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
                <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; color: #2b2c28;">${name}</td>
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

    const { data, error } = await resend.emails.send({
      from: 'Invitación Candy & Agustín <onboarding@resend.dev>',
      to: ['dg.candy99@gmail.com'],
      subject: `RSVP: ${name} — ${willAttend ? 'Asiste' : 'No asiste'} (${guestText})`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('RSVP API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}