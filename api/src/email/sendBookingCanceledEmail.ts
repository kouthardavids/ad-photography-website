import { getTransporter } from "./transporter.js";
import { bookingCanceledEmail } from "./templates/bookingCanceled.js";

type Props = {
    booking: {
        name: string;
        email: string;
        ref: string;
        date: string;
    };
    reason: string;
};

export const sendBookingCanceledEmail = async ({
    booking,
    reason,
}: Props) => {
    const { subject, html, text } = bookingCanceledEmail({
        name: booking.name,
        ref: booking.ref,
        date: booking.date,
        reason,
    });

    await getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: booking.email,
        subject,
        html,
        text,
    });
};