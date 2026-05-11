import nodemailer from 'nodemailer';

function createTransport() {
  if (process.env.MAIL_MAILER === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  // log mode — prints to console instead of sending
  return nodemailer.createTransport({ jsonTransport: true });
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  const transport = createTransport();
  const from = `"${process.env.MAIL_FROM_NAME ?? 'BrazilianClean'}" <${process.env.MAIL_FROM_ADDRESS ?? 'no-reply@brazilianclean.org'}>`;

  const info = await transport.sendMail({ from, to, subject, html });

  if (process.env.MAIL_MAILER !== 'smtp') {
    console.log('[MAIL LOG]', JSON.stringify(info.message ?? info, null, 2));
  }
}

export function emailVerificationHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Verificação de email — BrazilianClean</h2>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Use o código abaixo para confirmar seu endereço de email. Ele expira em <strong>10 minutos</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                  padding:20px;background:#f1f5f9;border-radius:12px;margin:24px 0">
        ${code}
      </div>
      <p style="color:#64748b;font-size:13px">Se você não criou uma conta, ignore este email.</p>
    </div>
  `;
}

export function passwordResetHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Redefinição de senha — BrazilianClean</h2>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Use o código abaixo para redefinir sua senha. Ele expira em <strong>10 minutos</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                  padding:20px;background:#f1f5f9;border-radius:12px;margin:24px 0">
        ${code}
      </div>
      <p style="color:#64748b;font-size:13px">Se você não solicitou isso, ignore este email.</p>
    </div>
  `;
}
