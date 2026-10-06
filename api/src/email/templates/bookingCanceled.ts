export type BookingCanceledEmailData = {
    name: string;
    ref: string;
    date: string;
    reason: string;
};

const INK = "#171717";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const PAGE_BG = "#f5f5f5";

const SERIF =
    "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

const SANS =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const MONO =
    "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export function bookingCanceledEmail(
    data: BookingCanceledEmailData
) {
    const business =
        process.env.BUSINESS_NAME ?? "AD Photography";

    const firstName =
        data.name.trim().split(/\s+/)[0] ?? "there";

    const prettyDate = formatDate(data.date);

    const safeName = escapeHtml(firstName);
    const safeRef = escapeHtml(data.ref);
    const safeReason = escapeHtml(data.reason);

    const subject = `Booking update: ${data.ref}`;

    const preheader =
        `An update regarding your booking ${data.ref}.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: ${PAGE_BG};
    font-family: ${SANS};
    color: ${INK};
">

    <div style="
        padding: 40px 20px;
        background: ${PAGE_BG};
    ">

        <div style="
            max-width: 560px;
            margin: 0 auto;
        ">

            <div style="
                display: none;
                max-height: 0;
                overflow: hidden;
                opacity: 0;
            ">
                ${escapeHtml(preheader)}
            </div>

            <div style="
                background: #ffffff;
                border: 1px solid ${BORDER};
                padding: 40px;
            ">

                <p style="
                    margin: 0 0 24px;
                    font-family: ${SERIF};
                    font-size: 28px;
                    font-weight: 400;
                ">
                    ${business}
                </p>

                <p style="
                    margin: 0;
                    font-size: 12px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: ${MUTED};
                ">
                    Booking update
                </p>

                <h1 style="
                    margin: 10px 0 12px;
                    font-family: ${SERIF};
                    font-size: 38px;
                    line-height: 1.1;
                    font-weight: 400;
                ">
                    Booking cancelled
                </h1>

                <p style="
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.7;
                    color: ${MUTED};
                ">
                    Hi ${safeName},
                </p>

                <p style="
                    margin: 14px 0 0;
                    font-size: 15px;
                    line-height: 1.7;
                    color: ${MUTED};
                ">
                    Thank you for your booking request. Unfortunately,
                    we are unable to accommodate your booking on this
                    occasion.
                </p>

                <div style="
                    margin-top: 28px;
                    padding: 20px;
                    border: 1px solid ${BORDER};
                    background: #ffffff;
                ">

                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">

                        <span style="
                            font-family: ${MONO};
                            font-size: 13px;
                            letter-spacing: 0.08em;
                        ">
                            ${safeRef}
                        </span>

                        <span style="
                            display: inline-block;
                            padding: 6px 10px;
                            border-radius: 999px;
                            background: #f5e8e8;
                            color: #9b3d3d;
                            font-size: 11px;
                            font-weight: 600;
                            letter-spacing: 0.08em;
                            text-transform: uppercase;
                        ">
                            Cancelled
                        </span>

                    </div>

                </div>

                <div style="
                    margin-top: 24px;
                    border-top: 1px solid ${BORDER};
                    border-bottom: 1px solid ${BORDER};
                ">

                    <div style="
                        padding: 14px 0;
                        border-bottom: 1px solid ${BORDER};
                    ">
                        <span style="
                            display: block;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.12em;
                            color: ${MUTED};
                        ">
                            Booking date
                        </span>

                        <span style="
                            display: block;
                            margin-top: 5px;
                            font-size: 14px;
                        ">
                            ${prettyDate}
                        </span>
                    </div>

                    <div style="
                        padding: 14px 0;
                    ">
                        <span style="
                            display: block;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.12em;
                            color: ${MUTED};
                        ">
                            Reason
                        </span>

                        <span style="
                            display: block;
                            margin-top: 5px;
                            font-size: 14px;
                            line-height: 1.6;
                        ">
                            ${safeReason}
                        </span>
                    </div>

                </div>

                <p style="
                    margin: 26px 0 0;
                    font-size: 15px;
                    line-height: 1.7;
                    color: ${MUTED};
                ">
                    We sincerely apologise for any inconvenience this
                    may cause and appreciate your understanding.
                </p>

                <p style="
                    margin: 14px 0 0;
                    font-size: 15px;
                    line-height: 1.7;
                    color: ${MUTED};
                ">
                    If you have any questions, please feel free to reply
                    to this email and we will be happy to assist you.
                </p>

                <p style="
                    margin: 28px 0 0;
                    font-family: ${SERIF};
                    font-size: 18px;
                ">
                    Kind regards,<br />
                    ${business}
                </p>

            </div>

            <p style="
                margin: 20px 0 0;
                text-align: center;
                font-size: 11px;
                color: ${MUTED};
            ">
                Booking reference: ${safeRef}
            </p>

        </div>

    </div>

</body>
</html>
`;

    const text = `
${business}

Booking cancelled

Hi ${firstName},

Thank you for your booking request. Unfortunately, we are unable to accommodate your booking on this occasion.

Booking reference: ${data.ref}

Booking date: ${prettyDate}

Reason:
${data.reason}

We sincerely apologise for any inconvenience this may cause and appreciate your understanding.

If you have any questions, please feel free to reply to this email and we will be happy to assist you.

Kind regards,
${business}
`;

    return {
        subject,
        html,
        text,
    };
}