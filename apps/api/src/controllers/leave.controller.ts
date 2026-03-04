import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { applyLeave, cancelLeave, listLeave, updateLeaveStatus } from "../services/leave.service.js";
import { createAuditLog } from "../utils/audit.js";
import { listLeaveSchema } from "../utils/validations.js";
import { BadRequestError } from "../utils/errors.js";

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
        teamConflictWarning: result.warning,
        warningMessage: result.warningMessage ?? null,
      },
    });

    sendSuccess(
      res,
      {
        leaveRequest: result.leaveRequest,
        warning: result.warning,
        warningMessage: result.warningMessage ?? null,
      },
      "Leave applied successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const listLeaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = listLeaveSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { userId, workspaceId, role, teamId } = req.user!;
    const result = await listLeave(
      parsed.data,
      userId,
      workspaceId,
      role,
      teamId,
    );

    sendSuccess(res, result, "Leave requests fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId, role, teamId } = req.user!;
    const rawId = req.params["id"];
    const leaveId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!leaveId) {
      return next(new BadRequestError("Leave request ID is required"));
    }

    // req.body is already validated + typed by the validate() middleware
    const input = req.body as { status: "APPROVED" | "REJECTED"; comment?: string | undefined };

    const updated = await updateLeaveStatus(
      leaveId,
      input,
      userId,
      workspaceId,
      role,
      teamId,
    );

    createAuditLog({
      action: input.status === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      userId,
      workspaceId,
      targetId: updated.id,
      targetType: "LeaveRequest",
      ipAddress: req.ip,
      metadata: {
        newStatus: input.status,
        previousStatus: "PENDING",
        teamId: updated.teamId,
        leaveType: updated.type,
        comment: input.comment ?? null,
      },
    });

    const message =
      input.status === "APPROVED" ? "Leave approved" : "Leave rejected";
    sendSuccess(res, { leave: updated }, message);
  } catch (error) {
    next(error);
  }
};

export const cancelLeaveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId } = req.user!;
    const rawId = req.params["id"];
    const leaveId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!leaveId) {
      return next(new BadRequestError("Leave request ID is required"));
    }

    const cancelled = await cancelLeave(leaveId, userId, workspaceId);

    createAuditLog({
      action: "LEAVE_CANCELLED",
      userId,
      workspaceId,
      targetId: cancelled.id,
      targetType: "LeaveRequest",
      ipAddress: req.ip,
      metadata: {
        leaveType: cancelled.type,
        teamId: cancelled.teamId,
        startDate: cancelled.startDate.toISOString(),
        endDate: cancelled.endDate.toISOString(),
      },
    });

    sendSuccess(res, { leave: cancelled }, "Leave cancelled successfully");
  } catch (error) {
    next(error);
  }
};
