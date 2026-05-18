import * as Sentry from "@sentry/node";

if (!process.env.SENTRY_DSN) {
  console.warn('[Sentry] SENTRY_DSN not set — Sentry disabled');
  // Do not call Sentry.init
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production',
    sendDefaultPii: true,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  });
}
