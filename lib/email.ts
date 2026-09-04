import nodemailer from 'nodemailer';

function createTransport() {
  if (process.env.MAIL_MAILER === 'smtp') {
    const host = process.env.MAIL_HOST;
    const user = process.env.MAIL_USERNAME;
    const pass = process.env.MAIL_PASSWORD;

    // Fail fast with a clear message if the SMTP secrets aren't configured —
    // otherwise nodemailer throws a cryptic error deep in the connection.
    if (!host || !user || !pass) {
      throw new Error(
        `SMTP is not fully configured (missing ${[!host && 'MAIL_HOST', !user && 'MAIL_USERNAME', !pass && 'MAIL_PASSWORD'].filter(Boolean).join(', ')})`,
      );
    }

    return nodemailer.createTransport({
      host,
      port: Number(process.env.MAIL_PORT) || 587,
      auth: { user, pass },
      // Fail fast instead of hanging the whole request if the SMTP port is
      // blocked/unreachable (e.g. a host that blocks outbound port 587).
      connectionTimeout: 10_000,
      greetingTimeout:   10_000,
      socketTimeout:     15_000,
    });
  }
  // log mode — prints to console instead of sending
  return nodemailer.createTransport({ jsonTransport: true });
}

// Escapes text before it goes into an email body.
//
// Notification emails carry values the sender did not write: a lead notification
// embeds the client's typed address, and every template embeds an account name
// chosen at signup. Interpolating those raw lets one user put arbitrary markup —
// a spoofed message, a phishing link — into an email another user receives.
function esc(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  const transport = createTransport();
  const from = `"${process.env.MAIL_FROM_NAME ?? 'Verliks'}" <${process.env.MAIL_FROM_ADDRESS ?? 'no-reply@verliks.com'}>`;

  const info = await transport.sendMail({ from, to, subject, html });

  if (process.env.MAIL_MAILER !== 'smtp') {
    console.log('[MAIL LOG]', JSON.stringify(info.messageId ?? info, null, 2));
  }
}

export function emailVerificationHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Email verification — Verliks</h2>
      <p>Hi <strong>${esc(name)}</strong>,</p>
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
      <div style="background:#1E3A5F;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px;font-weight:700">Verliks</h1>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #E3E8EE;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#0A2540;margin:0 0 16px">Your documents have been approved! ✅</h2>
        <p style="color:#425466;line-height:1.6">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#425466;line-height:1.6">
          Great news! Your identity documents have been reviewed and <strong style="color:#16a34a">approved</strong> by our team.
          Your account is now fully verified and you can start accepting cleaning jobs on Verliks.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:24px 0">
          <p style="color:#15803d;margin:0;font-weight:600">✓ Account verified — you're ready to go!</p>
        </div>
        <p style="color:#425466;line-height:1.6">
          Log in to your dashboard to update your profile, set your availability, and start receiving leads.
        </p>
        <p style="color:#697386;font-size:13px;margin-top:32px">
          — The Verliks Team
        </p>
      </div>
    </div>
  `;
}

export function verificationRejectedHtml(name: string, reason?: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <div style="background:#1E3A5F;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px;font-weight:700">Verliks</h1>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #E3E8EE;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#0A2540;margin:0 0 16px">Document verification update</h2>
        <p style="color:#425466;line-height:1.6">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#425466;line-height:1.6">
          After reviewing your submitted documents, our team was unable to approve your verification at this time.
        </p>
        ${reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:24px 0">
          <p style="color:#991b1b;margin:0 0 4px;font-weight:600">Reason:</p>
          <p style="color:#7f1d1d;margin:0">${esc(reason)}</p>
        </div>` : ''}
        <p style="color:#425466;line-height:1.6">
          Please review the reason above, correct your documents, and resubmit through your cleaner dashboard.
          If you believe this is a mistake, please contact our support team.
        </p>
        <p style="color:#697386;font-size:13px;margin-top:32px">
          — The Verliks Team
        </p>
      </div>
    </div>
  `;
}

export function passwordResetHtml(code: string, name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Password reset — Verliks</h2>
      <p>Hi <strong>${esc(name)}</strong>,</p>
      <p>Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                  padding:20px;background:#f1f5f9;border-radius:12px;margin:24px 0">
        ${code}
      </div>
      <p style="color:#64748b;font-size:13px">If you did not request this, please ignore this email.</p>
    </div>
  `;
}

// Generic notification email — mirrors an in-app notification so a cleaner who
// is not sitting on the dashboard still hears about a lead. Kept deliberately
// plain: the notification body is already written for the reader.
export function notificationHtml(opts: {
  name:   string;
  title:  string;
  body?:  string;
  ctaUrl: string;
  ctaLabel: string;
  urgent?: boolean;
}) {
  const { name, title, body, ctaUrl, ctaLabel, urgent } = opts;
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <div style="background:#1E3A5F;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px;font-weight:700">Verliks</h1>
      </div>
      <div style="padding:32px;background:#ffffff;border:1px solid #E3E8EE;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#0A2540;margin:0 0 16px">${esc(title)}</h2>
        <p style="color:#425466;line-height:1.6">Hi <strong>${esc(name)}</strong>,</p>
        ${body ? `<p style="color:#425466;line-height:1.6">${esc(body)}</p>` : ''}
        ${urgent ? `
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;padding:16px;margin:24px 0">
          <p style="color:#92400E;margin:0;font-weight:600">⏱ This one is time-sensitive — open it now.</p>
        </div>` : ''}
        <p style="margin:28px 0">
          <a href="${esc(ctaUrl)}"
             style="background:#1E3A5F;color:#ffffff;text-decoration:none;padding:12px 24px;
                    border-radius:6px;font-weight:700;display:inline-block">${esc(ctaLabel)}</a>
        </p>
        <p style="color:#697386;font-size:13px;margin-top:32px">— The Verliks Team</p>
      </div>
    </div>
  `;
}
