
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRoutes } from "./routes/auth.routes.js";
import { leaveRoutes } from "./routes/leave.routes.js";
import { reportsRoutes } from "./routes/reports.routes.js";
import { teamRoutes } from "./routes/team.routes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimit, authRateLimit } from "./middleware/security.js";

export const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRateLimit, authRoutes);
app.use("/leave", leaveRoutes);
app.use("/reports", reportsRoutes);
app.use("/teams", teamRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API running 🚀" });
});

app.use(errorHandler);
