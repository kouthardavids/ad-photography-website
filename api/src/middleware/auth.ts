import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        );

        if (
            typeof decoded === "string" ||
            !("id" in decoded) ||
            !("email" in decoded) ||
            !("role" in decoded)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid session.",
            });
        }

        req.user = {
            id: String(decoded.id),
            email: String(decoded.email),
            role: String(decoded.role),
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session.",
        });
    }
};