export type BookingRescheduledEmailData = {
    name: string;
    ref: string;
    packageName: string;
    price: number;
    date: string;
    times: string[];
};

const INK = "#171717";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const PAGE_BG = "#f5f5f5";

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

const detailRow = (
    label: string,
    value: string,
    isLast = false
) => `
<tr>
  <td style="padding:14px 0;${isLast ? "" : `border-bottom:1px solid ${BORDER};`}">
    <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">${label}</div>
    <div style="margin-top:4px;font-family:${SANS};font-size:15px;color:${INK};">${value}</div>
  </td>
</tr>`;

export function bookingRescheduledEmail(
    data: BookingRescheduledEmailData
) {
    const business =
        process.env.BUSINESS_NAME ?? "AD Photography";

    const firstName =
        data.name.trim().split(/\s+/)[0] ?? "there";

    const prettyDate = formatDate(data.date);
    const prettyTimes = data.times.join(", ");

    const totalPrice = data.price;
    const deposit = totalPrice / 2;
    const remainingBalance = totalPrice - deposit;

    const prettyPrice =
        `R${totalPrice.toLocaleString("en-ZA")}`;

    const prettyDeposit =
        `R${deposit.toLocaleString("en-ZA")}`;

    const prettyRemaining =
        `R${remainingBalance.toLocaleString("en-ZA")}`;

    const subject =
        `Booking rescheduled: ${data.ref}`;

    const preheader =
        `Your booking has been successfully rescheduled. Reference ${data.ref}.`;

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

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td
              align="center"
              style="padding-bottom:24px;font-family:${SANS};font-size:12px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:${INK};"
            >
              ${escapeHtml(business)}
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border:1px solid ${BORDER};border-radius:8px;padding:40px 36px;">

              <div style="font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">
                Booking rescheduled
              </div>

              <h1 style="margin:12px 0 0;font-family:${SERIF};font-size:38px;font-weight:400;line-height:1.15;color:${INK};">
                Your booking has been updated, ${escapeHtml(firstName)}
              </h1>

              <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${MUTED};">
                Your photography booking has been successfully rescheduled. Please see your updated booking details below.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid ${BORDER};border-radius:8px;">

                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid ${BORDER};">

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>

                        <td>
                          <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">
                            Reference
                          </div>

                          <div style="margin-top:6px;font-family:${MONO};font-size:26px;letter-spacing:0.2em;color:${INK};">
                            ${escapeHtml(data.ref)}
                          </div>
                        </td>

                        <td align="right" valign="top">
                          <span style="display:inline-block;border:1px solid #d4d4d4;border-radius:999px;padding:5px 12px;font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${INK};">
                            <span style="color:#16a34a;">&#9679;</span>&nbsp;Rescheduled
                          </span>
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>

                <tr>
                  <td style="padding:6px 24px;">

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                      ${detailRow(
        "Package",
        escapeHtml(data.packageName)
    )}

                      ${detailRow(
        "Date",
        escapeHtml(prettyDate)
    )}

                      ${detailRow(
        "Time",
        escapeHtml(prettyTimes)
    )}

                      ${detailRow(
        "Total Price",
        escapeHtml(prettyPrice),
        true
    )}

                    </table>

                  </td>
                </tr>

              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid ${BORDER};border-radius:8px;">

                <tr>
                  <td style="padding:20px 24px;">

                    <div style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">
                      Payment
                    </div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">

                      <tr>
                        <td style="padding-bottom:10px;font-family:${SANS};font-size:14px;color:${MUTED};">
                          50% deposit
                        </td>

                        <td align="right" style="padding-bottom:10px;font-family:${SANS};font-size:14px;color:${INK};">
                          ${escapeHtml(prettyDeposit)}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-top:10px;border-top:1px solid ${BORDER};font-family:${SANS};font-size:14px;font-weight:500;color:${INK};">
                          Remaining balance
                        </td>

                        <td align="right" style="padding-top:10px;border-top:1px solid ${BORDER};font-family:${SANS};font-size:14px;font-weight:500;color:${INK};">
                          ${escapeHtml(prettyRemaining)}
                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

              <p style="margin:28px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};">
                The remaining 50% is due on the day of your shoot, before the session begins.
              </p>

              <p style="margin:16px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};">
                Please keep your reference handy. If you need to make another change or have a question, reply to this email and quote it.
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
        `Your booking has been updated, ${firstName}`,
        "",
        "Your photography booking has been successfully rescheduled.",
        "",
        `Reference: ${data.ref}`,
        "Status: Rescheduled",
        `Package: ${data.packageName}`,
        `Date: ${prettyDate}`,
        `Time: ${prettyTimes}`,
        `Total Price: ${prettyPrice}`,
        "",
        `50% deposit: ${prettyDeposit}`,
        `Remaining balance: ${prettyRemaining}`,
        "",
        "The remaining 50% is due on the day of your shoot, before the session begins.",
        "",
        "Please keep your reference handy. If you need to make another change or have a question, reply to this email and quote it.",
        "",
        business,
    ].join("\n");

    return { subject, html, text };
}