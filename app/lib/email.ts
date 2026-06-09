import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendAccountApprovedEmail(to: string, name: string, role: string) {
  const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/phnavt";
  const loginUrl = `${appUrl}${basePath}/login`;

  const roleDescriptions: Record<string, string> = {
    IT: "Full admin access",
    BD: "Customer records access",
    PVD: "Vendor records access",
    USER: "View-only access",
  };
  const roleDesc = roleDescriptions[role] ?? "Standard access";

  await transporter.sendMail({
    from: `"PHN Manufacturing" <${fromAddress}>`,
    to,
    subject: "Your account has been approved — Amortization Volume Tracker",
    html: `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light only" />
          <meta name="supported-color-schemes" content="light" />
          <style>
            :root { color-scheme: light only; }
            body, .email-body { background-color: #f1f5f9 !important; }
            [data-ogsc] .card-bg { background-color: #ffffff !important; }
            [data-ogsc] .header-bg { background-color: #059669 !important; }
            [data-ogsc] .footer-bg { background-color: #f8fafc !important; }
            [data-ogsc] .heading { color: #111827 !important; }
            [data-ogsc] .body-copy { color: #374151 !important; }
            [data-ogsc] .muted { color: #6b7280 !important; }
            [data-ogsc] .footer-copy { color: #9ca3af !important; }
            [data-ogsc] .btn-text { color: #ffffff !important; }
            [data-ogsc] .header-label { color: #a7f3d0 !important; }
            [data-ogsc] .header-title { color: #ffffff !important; }
            [data-ogsc] .badge-bg { background-color: #d1fae5 !important; }
            [data-ogsc] .badge-text { color: #065f46 !important; }
          </style>
        </head>
        <body class="email-body" style="margin:0;padding:0;background-color:#f1f5f9;">
          <table class="email-body" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f1f5f9;padding:40px 16px;">
            <tr>
              <td align="center">
                <table class="card-bg" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td class="header-bg" bgcolor="#059669" style="background-color:#059669;padding:28px 40px;border-radius:11px 11px 0 0;">
                      <p class="header-label" style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#a7f3d0;font-family:Arial,sans-serif;">PHN Manufacturing</p>
                      <p class="header-title" style="margin:0;font-size:20px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Amortization Volume Tracker</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td class="card-bg" style="padding:32px 40px;background-color:#ffffff;">
                      <p class="heading" style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hi ${name},</p>
                      <p class="body-copy" style="margin:0 0 24px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,sans-serif;">
                        Great news — your account has been approved by an IT admin. You can now sign in to the Amortization Volume Tracker.
                      </p>

                      <!-- Role badge -->
                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 24px 0;">
                        <tr>
                          <td class="badge-bg" bgcolor="#d1fae5" style="background-color:#d1fae5;border-radius:8px;padding:12px 16px;">
                            <p style="margin:0 0 2px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#065f46;font-family:Arial,sans-serif;">Your Role</p>
                            <p class="badge-text" style="margin:0;font-size:14px;font-weight:700;color:#065f46;font-family:Arial,sans-serif;">${role} &mdash; ${roleDesc}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 28px 0;">
                        <tr>
                          <td>
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                              href="${loginUrl}"
                              style="height:44px;v-text-anchor:middle;width:160px;"
                              arcsize="18%" stroke="f" fillcolor="#059669">
                              <w:anchorlock/>
                              <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">Sign In &#8594;</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a class="btn-text" href="${loginUrl}" target="_blank"
                              style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:8px;background-color:#059669;mso-hide:all;">
                              Sign In &#8594;
                            </a>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                        <tr>
                          <td style="border-top:1px solid #e5e7eb;padding-top:20px;">
                            <p class="muted" style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;">
                              If you have any questions, contact your IT administrator.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td class="footer-bg" bgcolor="#f8fafc" style="background-color:#f8fafc;border-top:1px solid #e5e7eb;padding:14px 40px;border-radius:0 0 11px 11px;">
                      <p class="footer-copy" style="margin:0;font-size:11px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;">
                        &copy; ${new Date().getFullYear()} PHN Manufacturing &middot; Internal use only
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"PHN Manufacturing" <${fromAddress}>`,
    to,
    subject: "Reset your password — Amortization Volume Tracker",
    html: `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light only" />
          <meta name="supported-color-schemes" content="light" />
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <!--<![endif]-->
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
          <style>
            :root { color-scheme: light only; supported-color-schemes: light; }
            body, .email-body { background-color: #f1f5f9 !important; color: #374151 !important; }
            /* Outlook new dark mode overrides */
            [data-ogsc] body,
            [data-ogsc] .email-body { background-color: #f1f5f9 !important; }
            [data-ogsc] .card-bg { background-color: #ffffff !important; }
            [data-ogsc] .header-bg { background-color: #1e40af !important; }
            [data-ogsc] .footer-bg { background-color: #f8fafc !important; }
            [data-ogsc] .heading { color: #111827 !important; }
            [data-ogsc] .body-copy { color: #374151 !important; }
            [data-ogsc] .muted { color: #6b7280 !important; }
            [data-ogsc] .footer-copy { color: #9ca3af !important; }
            [data-ogsc] .btn-bg { background-color: #2563eb !important; }
            [data-ogsc] .btn-text { color: #ffffff !important; }
            [data-ogsc] .header-label { color: #bfdbfe !important; }
            [data-ogsc] .header-title { color: #ffffff !important; }
            [data-ogsc] .link-color { color: #2563eb !important; }
            [data-ogsc] .divider { border-top-color: #e5e7eb !important; }
          </style>
        </head>
        <body class="email-body" style="margin:0;padding:0;background-color:#f1f5f9;">
          <table class="email-body" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f1f5f9;padding:40px 16px;">
            <tr>
              <td align="center">
                <table class="card-bg" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td class="header-bg" bgcolor="#1e40af" style="background-color:#1e40af;padding:28px 40px;border-radius:11px 11px 0 0;">
                      <p class="header-label" style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bfdbfe;font-family:Arial,sans-serif;">PHN Manufacturing</p>
                      <p class="header-title" style="margin:0;font-size:20px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Amortization Volume Tracker</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td class="card-bg" style="padding:32px 40px;background-color:#ffffff;">
                      <p class="heading" style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hi ${name},</p>
                      <p class="body-copy" style="margin:0 0 28px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,sans-serif;">
                        We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in <strong style="color:#111827;">1 hour</strong>.
                      </p>

                      <!-- Button — VML for Outlook, regular <a> for everyone else -->
                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 28px 0;">
                        <tr>
                          <td>
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                              href="${resetUrl}"
                              style="height:44px;v-text-anchor:middle;width:196px;"
                              arcsize="18%"
                              stroke="f"
                              fillcolor="#2563eb">
                              <w:anchorlock/>
                              <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">Reset Password &#8594;</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a class="btn-text" href="${resetUrl}" target="_blank"
                              style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:8px;background-color:#2563eb;mso-hide:all;">
                              Reset Password &#8594;
                            </a>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>

                      <p class="muted" style="margin:0 0 6px 0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Or copy and paste this link into your browser:</p>
                      <p class="link-color" style="margin:0 0 28px 0;font-size:11px;color:#2563eb;word-break:break-all;font-family:Arial,sans-serif;">${resetUrl}</p>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                        <tr>
                          <td class="divider" style="border-top:1px solid #e5e7eb;padding-top:20px;">
                            <p class="muted" style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;">
                              If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td class="footer-bg" bgcolor="#f8fafc" style="background-color:#f8fafc;border-top:1px solid #e5e7eb;padding:14px 40px;border-radius:0 0 11px 11px;">
                      <p class="footer-copy" style="margin:0;font-size:11px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;">
                        &copy; ${new Date().getFullYear()} PHN Manufacturing &middot; Internal use only
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
