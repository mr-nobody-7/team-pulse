import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { applyLeave } from "../services/leave.service.js";

export const applyLeaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId, teamId } = req.user!;
    const result = await applyLeave(req.body, userId, workspaceId, teamId);
    sendSuccess(
      res,
      { leaveRequest: result.leaveRequest, warning: result.warning },
      "Leave applied successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};
