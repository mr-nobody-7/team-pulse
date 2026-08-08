import { apiReference } from "@scalar/express-api-reference";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import passport from "passport";
import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/node";
import { configureGoogleStrategy } from "./auth/strategies/google.strategy.js";
import { prisma } from "./lib/db.js";
import { doubleCsrfProtection } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
// sensitiveWriteRateLimit, csvExportRateLimit and feedbackRateLimit are applied
// inside their own route files, not here.
import { apiRateLimit, authRateLimit } from "./middleware/security.js";
import { openApiSpec } from "./openapi.js";
import { ForbiddenError } from "./utils/errors.js";
import { auditRoutes } from "./routes/audit.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { availabilityRoutes } from "./routes/availability.routes.js";
import { feedbackRoutes } from "./routes/feedback.routes.js";
import { holidayRoutes } from "./routes/holiday.routes.js";
import { leaveRoutes } from "./routes/leave.routes.js";
import { pushRoutes } from "./routes/push.routes.js";
import { reportsRoutes } from "./routes/reports.routes.js";
import { settingsRoutes } from "./routes/settings.routes.js";
import { slackRoutes } from "./routes/slack.routes.js";
import { teamRoutes } from "./routes/team.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { workspaceRoutes } from "./routes/workspace.routes.js";

export const app = express();

configureGoogleStrategy();

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

function resolveAllowedOrigins(): string[] {
  const isProduction = process.env.NODE_ENV === "production";
  const fromClientUrl = process.env.CLIENT_URL ?? "";
  const fromClientUrls = process.env.CLIENT_URLS ?? "";

  const configured = `${fromClientUrl},${fromClientUrls}`
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  if (configured.length > 0) {
    return Array.from(new Set(configured));
  }

  if (isProduction) {
    console.warn(
      "[CORS] No CLIENT_URL/CLIENT_URLS configured in production. No browser origins will be allowed.",
    );
    return [];
  }

  return ["http://localhost:3000"];
}

const allowedOrigins = resolveAllowedOrigins();

function shouldCaptureRawBodyUrl(url?: string): boolean {
  return (url ?? "").startsWith("/slack/");
}

app.set("trust proxy", 1);

// Add request ID middleware for audit trails and debugging
app.use((req, res, next) => {
  req.id =
    (req.headers["x-request-id"] as string) || randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests with no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        callback(null, true);
        return;
      }

      // ForbiddenError so this surfaces as a 403 rather than falling through to
      // the generic 500 branch and paging Sentry for a routine rejection.
      callback(new ForbiddenError(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token'
    ],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,  // cache preflight for 24 hours
  }),
);
app.use(helmet());
app.use(compression());
app.use(apiRateLimit);
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      if (shouldCaptureRawBodyUrl(req.url)) {
        (req as express.Request).rawBody = buf.toString("utf8");
      }
    },
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '100kb',  // form data should never be large
    verify: (req, _res, buf) => {
      if (shouldCaptureRawBodyUrl(req.url)) {
        (req as express.Request).rawBody = buf.toString("utf8");
      }
    },
  }),
);
app.use(cookieParser());
app.use(doubleCsrfProtection);
app.use(passport.initialize());

app.use("/auth", authRateLimit, authRoutes);
app.use("/leave", leaveRoutes);
app.use("/availability", availabilityRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/holidays", holidayRoutes);
app.use("/reports", reportsRoutes);
app.use("/settings", settingsRoutes);
app.use("/slack", slackRoutes);
app.use("/teams", teamRoutes);
app.use("/users", userRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/audit-logs", auditRoutes);
app.use("/push", pushRoutes);

// Liveness. No dependencies — answers "is this process up?" only.
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API running 🚀" });
});

// Readiness. Point the platform health check at this one: /health stays green
// while the database is unreachable, so a broken deploy would look healthy and
// take traffic that 500s on every real request.
app.get("/health/ready", async (_req, res) => {
  const timeout = new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error("readiness check timed out")), 2000);
  });

  try {
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    res.json({ success: true, message: "Ready", data: { database: "up" } });
  } catch (error) {
    console.error("[Readiness] Database check failed", error);
    res.status(503).json({
      success: false,
      message: "Not ready",
      data: { database: "down" },
    });
  }
});

 // Debug endpoint — development only
 if (process.env.NODE_ENV !== "production") {
   app.get("/debug-sentry", () => {
     throw new Error("My first Sentry error!");
   });
 }

// ── API Docs ───────────────────────────────────────────────────────────────
// Non-production only. These are unauthenticated and not rate-limited, and
// together they publish a complete map of every endpoint in the service.
if (process.env.NODE_ENV !== "production") {
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/reference",
    apiReference({
      theme: "purple",
      url: "/openapi.json",
    }),
  );
}

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);
