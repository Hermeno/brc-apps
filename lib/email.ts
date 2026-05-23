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
    console.log('[MAIL LOG]', JSON.stringify(info.messageId ?? info, null, 2));
  }
}

export function emailVerificationHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Email verification — BrazilianClean</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use the code below to confirm your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                  padding:20px;background:#f1f5f9;border-radius:12px;margin:24px 0">
        ${code}
      </div>
      <p style="color:#64748b;font-size:13px">If you did not create an account, please ignore this email.</p>
    </div>
  `;
}

export function verificationApprovedHtml(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <div style="background:#0A80DB;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px;font-weight:700">BrazilianClean</h1>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #E3E8EE;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#0A2540;margin:0 0 16px">Your documents have been approved! ✅</h2>
        <p style="color:#425466;line-height:1.6">Hi <strong>${name}</strong>,</p>
        <p style="color:#425466;line-height:1.6">
          Great news! Your identity documents have been reviewed and <strong style="color:#16a34a">approved</strong> by our team.
          Your account is now fully verified and you can start accepting cleaning jobs on BrazilianClean.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:24px 0">
          <p style="color:#15803d;margin:0;font-weight:600">✓ Account verified — you're ready to go!</p>
        </div>
        <p style="color:#425466;line-height:1.6">
          Log in to your dashboard to update your profile, set your availability, and start receiving leads.
        </p>
        <p style="color:#697386;font-size:13px;margin-top:32px">
          — The BrazilianClean Team
        </p>
      </div>
    </div>
  `;
}

export function verificationRejectedHtml(name: string, reason?: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <div style="background:#0A80DB;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px;font-weight:700">BrazilianClean</h1>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #E3E8EE;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#0A2540;margin:0 0 16px">Document verification update</h2>
        <p style="color:#425466;line-height:1.6">Hi <strong>${name}</strong>,</p>
        <p style="color:#425466;line-height:1.6">
          After reviewing your submitted documents, our team was unable to approve your verification at this time.
        </p>
        ${reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:24px 0">
          <p style="color:#991b1b;margin:0 0 4px;font-weight:600">Reason:</p>
          <p style="color:#7f1d1d;margin:0">${reason}</p>
        </div>` : ''}
        <p style="color:#425466;line-height:1.6">
          Please review the reason above, correct your documents, and resubmit through your cleaner dashboard.
          If you believe this is a mistake, please contact our support team.
        </p>
        <p style="color:#697386;font-size:13px;margin-top:32px">
          — The BrazilianClean Team
        </p>
      </div>
    </div>
  `;
}

export function passwordResetHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Password reset — BrazilianClean</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                  padding:20px;background:#f1f5f9;border-radius:12px;margin:24px 0">
        ${code}
      </div>
      <p style="color:#64748b;font-size:13px">If you did not request this, please ignore this email.</p>
    </div>
  `;
}
