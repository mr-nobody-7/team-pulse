import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

const DATABASE_CONNECTIVITY_ERROR_CODES = new Set([
  "P1001",
  "P1002",
  "P1017",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ETIMEDOUT",
]);

function isCsrfError(err: Error): boolean {
  return (err as { code?: unknown }).code === "EBADCSRFTOKEN";
}

function isDatabaseConnectivityError(err: Error): boolean {
  const maybeCode = (err as { code?: unknown }).code;
  if (typeof maybeCode === "string") {
    return DATABASE_CONNECTIVITY_ERROR_CODES.has(maybeCode);
  }

  return false;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Thrown by the double-submit CSRF middleware. This is a client-side
  // condition, not a server fault, so it must not fall through to the 500
  // branch below.
  if (isCsrfError(err)) {
    res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
      code: "EBADCSRFTOKEN",
    });
    return;
  }

  if (isDatabaseConnectivityError(err)) {
    console.error(`[${req.id}] [Infrastructure Error] Database connectivity`, err);
    res.status(503).json({
      success: false,
      message: "Database temporarily unavailable",
    });
    return;
  }

  console.error(`[${req.id}] [Unhandled Error]`, err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
