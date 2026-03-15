import type { NextFunction, Request, Response } from "express";

import {
  getDashboardSummary,
  getReportsAnalytics,
} from "../services/reports.service.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { reportsAnalyticsSchema } from "../utils/validations.js";

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

export const getAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = reportsAnalyticsSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { userId, workspaceId, role, teamId } = req.user!;

    const analytics = await getReportsAnalytics({
      userId,
      workspaceId,
      role,
      teamId,
      ...(parsed.data.month ? { month: parsed.data.month } : {}),
      ...(parsed.data.from ? { from: parsed.data.from } : {}),
      ...(parsed.data.to ? { to: parsed.data.to } : {}),
      ...(parsed.data.team_id ? { teamFilterId: parsed.data.team_id } : {}),
    });

    sendSuccess(res, analytics, "Reports analytics fetched");
  } catch (error) {
    next(error);
  }
};
