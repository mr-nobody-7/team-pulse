import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

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

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
