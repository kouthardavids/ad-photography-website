import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

if (!accountSid || !authToken || !from) {
    throw new Error("Twilio WhatsApp credentials are not configured.");
}

const client = twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (
    to: string,
    body: string
) => {
    const phone = to.replace(/\D/g, "");

    return client.messages.create({
        from,
        to: `whatsapp:+${phone}`,
        body,
    });
};