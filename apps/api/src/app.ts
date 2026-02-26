
import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use("/auth", authRoutes)

app.get("/health", (_req, res) => {
  res.json({ message: "API running 🚀" });
});
