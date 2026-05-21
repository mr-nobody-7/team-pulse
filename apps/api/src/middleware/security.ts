import rateLimit from "express-rate-limit";
import type { Request } from "express";

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
  keyGenerator: (req: Request) => (req.user as any)?.id || req.ip || 'unknown',
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
  keyGenerator: (req: Request) => (req.user as any)?.id || req.ip || 'unknown',
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
  keyGenerator: (req: Request) => (req.user as any)?.userId || req.ip || 'unknown',
});
