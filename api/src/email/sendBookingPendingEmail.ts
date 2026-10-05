import { getPackageId } from "../repo/packages.js";
import { getTransporter } from "./transporter.js";
import { bookingPendingEmail } from "./templates/bookingPending.js";

type Props = {
    booking: {
        ref: string;
        name: string;
        email: string;
        date: string;
        package_id: number;
    };
    times: string[];
};

export const sendBookingPendingEmail = async ({ booking, times }: Props) => {
    const pkg = await getPackageId(booking.package_id);

    const { subject, html, text } = bookingPendingEmail({
        name: booking.name,
        ref: booking.ref,
        packageName: pkg.name,
        price: pkg.price,
        date: booking.date,
        times,
    });

    await getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: booking.email,
        subject,
        html,
        text,
    });
};