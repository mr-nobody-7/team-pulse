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

function isDatabaseConnectivityError(err: Error): boolean {
  const maybeCode = (err as { code?: unknown }).code;
  if (typeof maybeCode === "string") {
    return DATABASE_CONNECTIVITY_ERROR_CODES.has(maybeCode);
  }

  return false;
}

export const errorHandler = (
  err: Error,
  _req: Request,
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

  if (isDatabaseConnectivityError(err)) {
    console.error("[Infrastructure Error] Database connectivity", err);
    res.status(503).json({
      success: false,
      message: "Database temporarily unavailable",
    });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
