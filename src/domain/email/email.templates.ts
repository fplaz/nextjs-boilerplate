const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #09090b; line-height: 1.3;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin: 0 0 16px 0; font-size: 14px; color: #71717a; line-height: 1.5;">${text}</p>`;
}

function ctaButton(label: string, href: string): string {
  return `          <tr>
            <td style="padding: 28px 32px;" align="center">
              <a href="${href}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1.5;">${label}</a>
            </td>
          </tr>`;
}

function footer(text: string): string {
  return `          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.6; text-align: center;">${text}</p>
            </td>
          </tr>`;
}

function greeting(firstName?: string): string {
  return firstName ? `Hi ${firstName},` : "Hi there,";
}

export function welcomeEmailHtml(firstName?: string): string {
  const content = `          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0 32px; text-align: center;">
              ${heading("Welcome to LaunchKit!")}
              ${paragraph(`${greeting(firstName)} thanks for signing up! Your 5-day free trial is now active — you can create up to 10 workspaces and track their performance.`)}
              ${paragraph("Head to your dashboard to get started.")}
            </td>
          </tr>
${ctaButton("Go to Dashboard", `${siteUrl}/dashboard`)}
${footer("You're receiving this email because you signed up for LaunchKit.")}`;

  return layout("Welcome to LaunchKit", content);
}

export function workspaceInviteHtml(args: {
  inviterEmail: string;
  workspaceName: string;
  inviteUrl: string;
}): string {
  const content = `          <tr>
            <td style="padding: 32px 32px 0 32px; text-align: center;">
              ${heading(`You're invited to join ${args.workspaceName}`)}
              ${paragraph(`${args.inviterEmail} invited you to join the ${args.workspaceName} workspace on LaunchKit.`)}
              ${paragraph("Use the link below to accept the invite. If you do not have an account yet, sign up with this same email address first.")}
            </td>
          </tr>
${ctaButton("Accept Invite", args.inviteUrl)}
${footer("You're receiving this email because someone invited you to a workspace on LaunchKit.")}`;

  return layout(`Join ${args.workspaceName}`, content);
}
