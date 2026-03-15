import type { NextFunction, Request, Response } from "express";

import {
  listWorkspaceLeaveTypes,
  updateWorkspaceLeaveTypes,
} from "../services/settings.service.js";
import type { UpdateLeaveTypesInput } from "../types/index.js";
import { createAuditLog } from "../utils/audit.js";
import { sendSuccess } from "../utils/response.js";

export const getLeaveTypesSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { workspaceId } = req.user!;
    const settings = await listWorkspaceLeaveTypes(workspaceId);
    sendSuccess(res, settings, "Leave types settings fetched");
  } catch (error) {
    next(error);
  }
};

export const updateLeaveTypesSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId } = req.user!;
    const settings = await updateWorkspaceLeaveTypes(
      workspaceId,
      req.body as UpdateLeaveTypesInput,
    );

    createAuditLog({
      action: "LEAVE_TYPES_UPDATED",
      userId,
      workspaceId,
      targetType: "Workspace",
      targetId: workspaceId,
      ipAddress: req.ip,
      metadata: {
        enabledTypes: settings.enabledTypes,
      },
    });

    sendSuccess(res, settings, "Leave types settings updated");
  } catch (error) {
    next(error);
  }
};
