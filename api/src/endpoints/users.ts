import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserByEmail } from "../repo/users.js";
import { requireAuth } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../types/auth.js";

dotenv.config();

const router = Router();

router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await getUserByEmail(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const validPassword = await argon2.verify(
            user.password_hash,
            password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "8h",
            }
        );

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        });

        return res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login failed:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid email or password.",
        });
    }
});

router.get("/auth/me", requireAuth, async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;

    return res.json({
        success: true,
        data: authenticatedReq.user,
    });
});

router.post("/auth/logout", (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.json({
        success: true,
        message: "Logged out successfully.",
    });
});

export default router;