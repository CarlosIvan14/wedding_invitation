import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const testData = {
    name: 'Carlos Ivan',
    guests: '2',
    attendance: 'si',
  };

  try {
    console.log('🚀 Enviando correo de prueba...');
    console.log('Datos:', testData);

    const { data, error } = await resend.emails.send({
      from: 'Invitación Candy & Agustín <onboarding@resend.dev>',
      to: ['carlosivanarmenta8@gmail.com'],
      subject: `RSVP: ${testData.name} — ${testData.attendance === 'si' ? 'Asiste' : 'No asiste'} (${testData.guests} personas)`,
      html: `
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
                  <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; color: #2b2c28;">${testData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; font-weight: 600; color: #455545;">Acompañantes:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #cfd8cf; color: #2b2c28;">${testData.guests} personas</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 600; color: #455545;">Asistencia:</td>
                  <td style="padding: 12px 0; color: #8ca18c; font-weight: 600;">
                    ✓ Con alegría, asistiré
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 14px; color: #8ca18c;">
                Enviado desde la invitación web de Candy & Agustín
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Error al enviar:', error);
      process.exit(1);
    }

    console.log('✅ Correo enviado exitosamente');
    console.log('ID del mensaje:', data?.id);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEmail();
