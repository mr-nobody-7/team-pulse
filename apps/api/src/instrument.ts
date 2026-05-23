import * as Sentry from "@sentry/node";

if (!process.env.SENTRY_DSN) {
  console.warn("[Sentry] SENTRY_DSN not set — Sentry disabled");
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    sendDefaultPii: true,
    enableLogs: true,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  });
}
