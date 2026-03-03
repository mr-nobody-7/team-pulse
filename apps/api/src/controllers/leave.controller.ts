import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { applyLeave } from "../services/leave.service.js";
import { createAuditLog } from "../utils/audit.js";

export const applyLeaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId, teamId } = req.user!;
    const result = await applyLeave(req.body, userId, workspaceId, teamId);

    createAuditLog({
      action: "LEAVE_APPLIED",
      userId,
      workspaceId,
      targetId: result.leaveRequest.id,
      targetType: "LeaveRequest",
      ipAddress: req.ip,
      metadata: {
        type: result.leaveRequest.type,
        status: result.leaveRequest.status,
        teamId: result.leaveRequest.teamId,
        startDate: result.leaveRequest.startDate.toISOString(),
        endDate: result.leaveRequest.endDate.toISOString(),
        startSession: result.leaveRequest.startSession,
        endSession: result.leaveRequest.endSession,
        teamConflictWarning: result.warning ?? null,
      },
    });

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
