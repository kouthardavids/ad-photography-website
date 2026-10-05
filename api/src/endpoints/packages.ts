import { Request, Response, Router } from "express";
import { getPackages } from "../repo/packages.js";

const router = Router();

router.get("/packages", async (req: Request, res: Response) => {
    try {
        const packages = await getPackages();

        res.json({
            success: true,
            data: packages,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;