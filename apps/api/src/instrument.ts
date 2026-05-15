import * as Sentry from "@sentry/node";

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ??
    "https://cc80f1e3fdcc86139c644ad442b996c4@o4511393466810368.ingest.us.sentry.io/4511394903293952",
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
