import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "noreply@fidco.fr";
const APP_NAME = "Fidco";

// ─── Templates HTML ────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;text-align:center;">
            <span style="font-size:28px;font-weight:900;color:#000;letter-spacing:-0.5px;">FP</span>
            <span style="font-size:18px;font-weight:700;color:#000;margin-left:10px;">${APP_NAME}</span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:#475569;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${APP_NAME} · Votre programme de fidélité digital</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email : Réinitialisation mot de passe ─────────────────────────

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;">Réinitialisation de mot de passe</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous&nbsp;:</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}"
        style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-top:24px;">
      <p style="color:#64748b;font-size:13px;margin:0;">⏱ Ce lien expire dans <strong style="color:#94a3b8;">1 heure</strong>.</p>
      <p style="color:#64748b;font-size:13px;margin:8px 0 0;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `🔐 Réinitialisation de votre mot de passe ${APP_NAME}`,
    html: baseTemplate(content),
  });
}

// ─── Email : Notification pro → clients ───────────────────────────

export async function sendBusinessNotification({
  recipients,
  businessName,
  subject,
  message,
}: {
  recipients: Array<{ email: string; firstName: string }>;
  businessName: string;
  subject: string;
  message: string;
}) {
  const results = await Promise.allSettled(
    recipients.map(({ email, firstName }) => {
      const content = `
        <p style="color:#f59e0b;font-size:13px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Message de ${businessName}</p>
        <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 20px;">${subject}</h1>

        <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0;">${message.replace(/\n/g, "<br/>")}</p>
        </div>

        <p style="color:#64748b;font-size:13px;margin:0;">Bonjour ${firstName}, ce message vous a été envoyé par <strong style="color:#94a3b8;">${businessName}</strong> via votre programme de fidélité Fidco.</p>
      `;
      return resend.emails.send({
        from: FROM,
        to: email,
        subject: `📣 ${subject} — ${businessName}`,
        html: baseTemplate(content),
      });
    })
  );

  const sentCount = results.filter((r) => r.status === "fulfilled").length;
  return { sentCount, total: recipients.length };
}

// ─── Email : Bienvenue nouveau client ─────────────────────────────

export async function sendWelcomeEmail({
  email,
  firstName,
  businessName,
  appUrl,
}: {
  email: string;
  firstName: string;
  businessName: string;
  appUrl: string;
}) {
  const content = `
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;">Bienvenue, ${firstName}&nbsp;! 🎉</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">Votre carte de fidélité <strong style="color:#f59e0b;">${businessName}</strong> a bien été créée.</p>

    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 4px;">✅ Carte de fidélité activée</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 4px;">📲 Accédez à vos tampons et récompenses</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0;">🎁 Profitez des offres exclusives</p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="${appUrl}/connexion/client"
        style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Accéder à ma carte
      </a>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `🎉 Votre carte de fidélité ${businessName} est prête !`,
    html: baseTemplate(content),
  });
}
