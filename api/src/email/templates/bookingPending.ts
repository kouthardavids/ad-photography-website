export type BookingEmailData = {
  name: string;
  ref: string;
  packageName: string;
  price: number;
  date: string; // YYYY-MM-DD
  times: string[]; // ["09:00", "10:00"]
};

// Colours match the Tailwind neutral palette used on the booking page
const INK = "#171717"; // neutral-900
const MUTED = "#737373"; // neutral-500
const BORDER = "#e5e5e5"; // neutral-200
const PAGE_BG = "#f5f5f5"; // neutral-100

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

const detailRow = (label: string, value: string, isLast = false) => `
<tr>
  <td style="padding:14px 0;${isLast ? "" : `border-bottom:1px solid ${BORDER};`}">
    <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">${label}</div>
    <div style="margin-top:4px;font-family:${SANS};font-size:15px;color:${INK};">${value}</div>
  </td>
</tr>`;

export function bookingPendingEmail(data: BookingEmailData) {
  const business = process.env.BUSINESS_NAME ?? "AD Photography";
  const firstName = data.name.trim().split(/\s+/)[0] ?? "there";

  const prettyDate = formatDate(data.date);
  const prettyTimes = data.times.join(", ");
  const prettyPrice = `R${data.price}`;

  const deposit = data.price / 2;
  const prettyDeposit = `R${deposit.toLocaleString("en-ZA")}`;

  const subject = `Booking received: ${data.ref}`;
  const preheader = `Your booking request is pending. Reference ${data.ref}.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td align="center" style="padding-bottom:24px;font-family:${SANS};font-size:12px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:${INK};">
              ${escapeHtml(business)}
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border:1px solid ${BORDER};border-radius:8px;padding:40px 36px;">

              <div style="font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">
                Booking received
              </div>

              <h1 style="margin:12px 0 0;font-family:${SERIF};font-size:38px;font-weight:400;line-height:1.15;color:${INK};">
                Thank you, ${escapeHtml(firstName)}
              </h1>

              <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${MUTED};">
                We have received your booking request. It is pending while we review it, and we will email you again as soon as it is confirmed.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid ${BORDER};border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid ${BORDER};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">Reference</div>
                          <div style="margin-top:6px;font-family:${MONO};font-size:26px;letter-spacing:0.2em;color:${INK};">${escapeHtml(data.ref)}</div>
                        </td>
                        <td align="right" valign="top">
                          <span style="display:inline-block;border:1px solid #d4d4d4;border-radius:999px;padding:5px 12px;font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${INK};">
                            <span style="color:#d97706;">&#9679;</span>&nbsp;Pending
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${detailRow("Package", escapeHtml(data.packageName))}
                      ${detailRow("Date", escapeHtml(prettyDate))}
                      ${detailRow("Time", escapeHtml(prettyTimes))}
                      ${detailRow("Price", escapeHtml(prettyPrice), true)}
                    </table>
                  </td>
                </tr>
              </table>

              <div style="margin-top:28px;padding:20px 24px;border:1px solid ${BORDER};border-radius:8px;background:#fafafa;">

              <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">
                Next step
              </div>

              <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.7;color:${INK};">
                In order to confirm your booking, the photographer will contact you via WhatsApp with payment details for the 50% deposit of <strong>${escapeHtml(prettyDeposit)}</strong>.
              </p>

              <p style="margin:12px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};">
                The remaining 50% balance will be due on the day of your shoot, before the session begins.
              </p>

            </div>

            <p style="margin:20px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};">
              Please keep your reference handy. If you need to change anything or have a question, reply to this email and quote it.
            </p>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;font-family:${SANS};font-size:11px;letter-spacing:0.1em;color:#a3a3a3;">
              ${escapeHtml(business)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Thank you, ${firstName}`,
    "",
    "We have received your booking request. Your booking is currently pending.",
    "",
    `Reference: ${data.ref}`,
    "Status: Pending",
    `Package: ${data.packageName}`,
    `Date: ${prettyDate}`,
    `Time: ${prettyTimes}`,
    `Price: ${prettyPrice}`,
    "",
    "NEXT STEP",
    "",
    `In order to confirm your booking, the photographer will contact you via WhatsApp with payment details for the 50% deposit of ${prettyDeposit}.`,
    "",
    "The remaining 50% balance will be due on the day of your shoot, before the session begins.",
    "",
    "Please keep your reference handy. If you need to change anything or have a question, reply to this email and quote it.",
    "",
    business,
  ].join("\n");

  return { subject, html, text };
}