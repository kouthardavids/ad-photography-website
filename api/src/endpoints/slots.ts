import { Request, Response, Router } from "express";
import { getBookedSlots } from "../repo/slots.js";

const router = Router();

router.get("/slots", async (req: Request, res: Response) => {
    try {
        const date = req.query.date;

        if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "A valid date (YYYY-MM-DD) is required.",
            });
        }

        const booked = await getBookedSlots(date);

        res.json({
            success: true,
            data: booked,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;