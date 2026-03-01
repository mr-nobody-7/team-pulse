
import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import { leaveRoutes } from "./routes/leave.routes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/leave", leaveRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API running 🚀" });
});

app.use(errorHandler);
