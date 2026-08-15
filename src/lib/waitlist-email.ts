import { waitlistEmailCopy } from "@/content/waitlist-copy";

/**
 * Branded HTML for the waitlist confirmation (2026-08-03). The first one
 * ever sent went out as bare plain text and, in Jake's words, "isn't
 * branded at all like other KINECT emails".
 *
 * The markup deliberately mirrors the PLATFORM's transactional email
 * design (kinect/platform `supabase/templates/change-email.html`) rather
 * than inventing a second look for the same brand: light `#f5f7fa` ground,
 * a 480px white card with a 3px accent rule across the top, the icon +
 * letter-spaced KINECT wordmark, and the same type ramp and greys. A
 * recipient who later gets a real product email should not feel they came
 * from two different companies.
 *
 * Email-client constraints, which is why this looks like 2005 HTML:
 *  - table layout with inline styles only. No flexbox, no <style> block,
 *    no external CSS -- Gmail strips head styles and Outlook renders via
 *    Word's engine.
 *  - PNG for the logo, never the site's icon.svg: SVG is blocked or
 *    ignored by most clients including Gmail and Outlook.
 *  - the brand display font is not loaded; webfonts are unreliable in mail
 *    so the wordmark uses the same system stack the platform template does.
 *
 * Always paired with the plain-text `body` (see the action) so clients
 * that refuse HTML, and accessibility tooling, still get the full message.
 */
export function waitlistEmailHtml(): string {
  const c = waitlistEmailCopy;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f7fa;margin:0;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e4e9f0;border-radius:14px;">
        <tr>
          <td style="height:3px;background-color:#0e93ac;border-radius:14px 14px 0 0;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:28px 32px 32px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
              <tr>
                <td style="padding-right:8px;"><img src="https://kinectnow.com/apple-icon.png" width="20" height="20" alt="" style="display:block;border-radius:4px;" /></td>
                <td style="font-size:15px;font-weight:700;letter-spacing:0.16em;color:#0c1220;">KINECT</td>
              </tr>
            </table>

            <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#0c1220;line-height:1.3;">${c.heading}</h1>

            <p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;color:#3b4658;">${c.intro}</p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
              <tr>
                <td style="background-color:#0e93ac;border-radius:8px;">
                  <a href="${c.ctaHref}" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${c.cta}</a>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid #d3dae4;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
            </table>

            <p style="margin:16px 0 0 0;font-size:12px;line-height:1.5;color:#96a0b2;">${c.reply}</p>

          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#96a0b2;">Where clients live. Where data lives. Where insights live.</p>
    </td>
  </tr>
</table>`;
}
