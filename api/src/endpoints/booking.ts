import { Request, Response, Router } from "express";
import { booking, countPendingByEmail } from "../repo/booking.js";
import { sendBookingPendingEmail } from "../email/sendBookingPendingEmail.js";
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

export default router;