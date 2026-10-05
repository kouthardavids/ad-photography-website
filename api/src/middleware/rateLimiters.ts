import { rateLimit } from "express-rate-limit";

// max 5 bookings attempts per IP every 15 minutes
export const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 100,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many booking attempts. Please try again in a few minutes.",
        });
    },
})

export const slotsLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests. Please slow down.",
        });
    },
});