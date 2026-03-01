import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { applyLeave } from "../services/leave.service.js";

export const applyLeaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await applyLeave(req.body);
    sendSuccess(res, "Leave applied successfully");
  } catch (error) {
    next(error);
  }
};
