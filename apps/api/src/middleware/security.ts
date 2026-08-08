import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Bucket per authenticated user, falling back to client IP for anonymous
 * requests.
 *
 * req.ip must go through ipKeyGenerator: express-rate-limit v8 throws
 * ERR_ERL_KEY_GEN_IPV6 for raw IPs because an IPv6 client can trivially rotate
 * within its /64 and evade a per-address bucket.
 */
function userOrIpKey(req: Request): string {
  const userId = req.user?.userId;
  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${ipKeyGenerator(req.ip ?? "unknown")}`;
}

// General API limiter to reduce abuse while keeping normal UX smooth.
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again shortly.",
  },
});

// Stricter limiter for authentication endpoints.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again shortly.",
  },
});

// Targeted rate limiter for sensitive write operations (1 hour window)
export const sensitiveWriteRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,                     // 20 write operations per hour
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
});

// Rate limiter for CSV/data exports
export const csvExportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                     // 10 exports per hour per user
  message: {
    success: false,
    message: 'Export limit reached. Try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
});

// Rate limiter for feedback submissions
export const feedbackRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                      // 5 feedback submissions per hour
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for account deletion (2 attempts per 24 hours per user)
export const accountDeletionRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2,
  message: {
    success: false,
    message: 'Too many deletion attempts. Please try again tomorrow.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
});

// Personal data export is intentionally restricted to one export per day.
export const personalDataExportRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message: {
    success: false,
    message: 'Your data was already exported today. Please try again tomorrow.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
});
