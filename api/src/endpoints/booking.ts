import { Request, Response, Router } from "express";
import {
    booking,
    getPendingBookings,
    confirmBooking,
    getBookingTimes,
    countPendingByEmail,
    cancelBooking,
    getConfirmedBookings,
    rescheduleBooking,
    getCanceledBookings,
} from "../repo/booking.js";
import { sendBookingCanceledEmail } from "../email/sendBookingCanceledEmail.js";
import { sendBookingPendingEmail } from "../email/sendBookingPendingEmail.js";
import { sendBookingConfirmedEmail } from "../email/sendBookingConfirmedEmail.js";
import { sendBookingRescheduledEmail } from "../email/sendBookingRescheduledEmail.js";
import { bookingLimiter } from "../middleware/rateLimiters.js";


import { isValidEmail, normalizeSAPhone } from "../utils/validation.js";

const MAX_PENDING_PER_EMAIL = 3;

const router = Router();

router.post("/booking", bookingLimiter, async (req: Request, res: Response) => {
    try {
        const { times, email, phone, name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required." });
        }

        if (typeof email !== "string" || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address." });
        }

        const normalizedPhone = typeof phone === "string" ? normalizeSAPhone(phone) : null;

        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid South African phone number.",
            });
        }

        if (!Array.isArray(times) || times.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Select at least one time slot.",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const pending = await countPendingByEmail(cleanEmail);

        if (pending >= MAX_PENDING_PER_EMAIL) {
            return res.status(429).json({
                success: false,
                message: "You already have pending bookings. Please wait until they are confirmed.",
            });
        }

        const newBooking = await booking({
            ...req.body,
            name: name.trim(),
            email: cleanEmail,
            phone: normalizedPhone,
        });

        // Not awaited on purpose: a mail problem should never fail a saved booking
        sendBookingPendingEmail({ booking: newBooking, times }).catch((err) =>
            console.error("Failed to send booking email:", err)
        );

        res.status(201).json({ success: true, data: newBooking });
    } catch (error: any) {
        // 23505 = unique violation, so one of the slots is already taken
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "One of those time slots was just booked. Please pick another.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// dashboard get bookings pending
router.get("/pending/bookings", async (req, res) => {
    try {
        const bookings = await getPendingBookings();

        res.json(bookings)
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings",
        });
    }
})

// update status -> confirmed when confirmed an existing pending booking request and then send email, 
// confirm and send the email that their booking is confirmed and secured,  
// and display dates and mention their remaining balance on the email and say The remaining 50% is due on the day of your shoot, before the session begins.
router.patch("/booking/:ref/confirm", async (req: Request, res: Response) => {
    try {
        const { ref } = req.params;

        if (typeof ref !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking reference.",
            });
        }

        const confirmedBooking = await confirmBooking(ref);

        const times = await getBookingTimes(confirmedBooking.id);

        // Don't let an email failure undo the booking confirmation
        try {
            await sendBookingConfirmedEmail({
                booking: confirmedBooking,
                times,
            });
        } catch (error) {
            console.error(
                "Failed to send booking confirmation email:",
                error
            );
        }

        return res.json({
            success: true,
            data: confirmedBooking,
        });
    } catch (error: any) {
        console.error("Failed to confirm booking:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to confirm booking.",
        });
    }
});

router.patch("/booking/:ref/cancel", async (req: Request, res: Response) => {
    try {
        const { ref } = req.params;
        const { reason } = req.body;

        if (typeof ref !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking reference.",
            });
        }

        if (typeof reason !== "string" || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required.",
            });
        }

        const canceledBooking = await cancelBooking(
            ref,
            reason.trim()
        );

        // Email failure should not undo the cancellation
        try {
            await sendBookingCanceledEmail({
                booking: canceledBooking,
                reason: reason.trim(),
            });
        } catch (error) {
            console.error(
                "Failed to send cancellation email:",
                error
            );
        }

        return res.json({
            success: true,
            data: canceledBooking,
        });
    } catch (error: any) {
        console.error("Failed to cancel booking:", error);

        // PGRST116 = no matching row (already canceled, or unknown reference)
        if (error.code === "PGRST116") {
            return res.status(404).json({
                success: false,
                message: "Booking not found or already canceled.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking.",
        });
    }
});

router.get("/confirmed/bookings", async (req, res) => {
    try {
        const bookings = await getConfirmedBookings();

        res.json(bookings);
    } catch (error) {
        console.error("Failed to fetch confirmed bookings:", error);

        res.status(500).json({
            message: "Failed to fetch confirmed bookings",
        });
    }
});

router.get("/canceled/bookings", async (req, res) => {
    try {
        const bookings = await getCanceledBookings();

        res.json(bookings);
    } catch (error) {
        console.error("Failed to fetch confirmed bookings:", error);

        res.status(500).json({
            message: "Failed to fetch confirmed bookings",
        });
    }
});

router.patch(
    "/booking/:ref/reschedule",
    async (req, res) => {
        try {
            const { ref } = req.params;
            const { date, times } = req.body;

            if (
                typeof date !== "string" ||
                !Array.isArray(times) ||
                times.length === 0 ||
                times.some(
                    (time) => typeof time !== "string"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Date and at least one time are required.",
                });
            }

            const updatedBooking =
                await rescheduleBooking(
                    ref,
                    date,
                    times
                );

            sendBookingRescheduledEmail({
                booking: updatedBooking,
                times: updatedBooking.times,
            }).catch((err) =>
                console.error(
                    "Failed to send reschedule email:",
                    err
                )
            );

            return res.json({
                success: true,
                data: updatedBooking,
            });
        } catch (error: any) {
            console.error(
                "Failed to reschedule booking:",
                error
            );

            if (error.name === "SlotConflict") {
                return res.status(409).json({
                    success: false,
                    message:
                        "One or more selected time slots are already booked.",
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Failed to reschedule booking.",
            });
        }
    }
);

export default router;