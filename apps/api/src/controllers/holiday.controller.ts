import type { NextFunction, Request, Response } from "express";

import { listPublicHolidays } from "../services/holiday.service.js";
import type { ListPublicHolidaysQuery } from "../types/index.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { listPublicHolidaysSchema } from "../utils/validations.js";

export const listPublicHolidaysController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = listPublicHolidaysSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { workspaceId } = req.user!;
    const result = await listPublicHolidays({
      workspaceId,
      query: parsed.data as ListPublicHolidaysQuery,
    });

    sendSuccess(res, result, "Public holidays fetched");
  } catch (error) {
    next(error);
  }
};
