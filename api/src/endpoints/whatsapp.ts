import { Request, Response, Router } from "express";
import { sendWhatsAppMessage } from "../services/whatsapp.js";

const router = Router();

router.post("/whatsapp/test", async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;

        if (typeof phone !== "string" || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required.",
            });
        }

        await sendWhatsAppMessage(
            phone,
            "Hi 👋 This is a test WhatsApp message from AD Photography."
        );

        return res.json({
            success: true,
            message: "WhatsApp message sent.",
        });
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp message.",
        });
    }
});

export default router;