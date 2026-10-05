import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST ?? "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT ?? 465),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return transporter;
};