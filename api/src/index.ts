import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import booking from "./endpoints/booking.js";
import packages from "./endpoints/packages.js"
import slots from "./endpoints/slots.js"

import users from "./endpoints/users.js"
import whatsapp from "./endpoints/whatsapp.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

const PORT = process.env.PORT;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());

app.use(cookieParser());

app.use("/api", booking)
app.use("/api", packages)
app.use("/api", slots);
app.use("/api", users);
app.use("/api", whatsapp);

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(
            `[server]: Server is running smoothly at http://localhost:${PORT}`
        );
    });
}

export default app;