import type { NextFunction, Request, Response } from "express";

import { getDashboardSummary } from "../services/reports.service.js";
import { sendSuccess } from "../utils/response.js";

export const getSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId, role, teamId } = req.user!;

    const summary = await getDashboardSummary({
      userId,
      workspaceId,
      role,
      teamId,
    });

    sendSuccess(res, summary, "Dashboard summary fetched");
  } catch (error) {
    next(error);
  }
};
