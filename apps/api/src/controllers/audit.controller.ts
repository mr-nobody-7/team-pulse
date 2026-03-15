import type { NextFunction, Request, Response } from "express";

import { listAuditLogs } from "../services/audit.service.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { listAuditLogsSchema } from "../utils/validations.js";

export const listAuditLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = listAuditLogsSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { workspaceId } = req.user!;
    const result = await listAuditLogs(workspaceId, parsed.data);
    sendSuccess(res, result, "Audit logs fetched");
  } catch (error) {
    next(error);
  }
};
