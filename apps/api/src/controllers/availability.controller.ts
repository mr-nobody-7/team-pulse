import type { NextFunction, Request, Response } from "express";

import {
  getAvailabilityBoard,
  setMyAvailability,
} from "../services/availability.service.js";
import type {
  AvailabilityBoardQuery,
  SetMyAvailabilityInput,
} from "../types/index.js";
import { createAuditLog } from "../utils/audit.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { availabilityBoardQuerySchema } from "../utils/validations.js";

export const getAvailabilityBoardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = availabilityBoardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { userId, workspaceId, role, teamId } = req.user!;
    const board = await getAvailabilityBoard({
      userId,
      workspaceId,
      role,
      teamId,
      query: parsed.data as AvailabilityBoardQuery,
    });

    sendSuccess(res, board, "Availability board fetched");
  } catch (error) {
    next(error);
  }
};

export const setMyAvailabilityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId } = req.user!;
    const result = await setMyAvailability(
      userId,
      workspaceId,
      req.body as SetMyAvailabilityInput,
    );

    createAuditLog({
      action: "USER_AVAILABILITY_UPDATED",
      userId,
      workspaceId,
      targetId: userId,
      targetType: "User",
      ipAddress: req.ip,
      metadata: {
        date: result.date,
        status: result.savedStatus,
        workload: result.savedWorkload,
      },
    });

    sendSuccess(res, result, "Availability updated");
  } catch (error) {
    next(error);
  }
};
