import type { NextFunction, Request, Response } from "express";

import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
} from "../services/user.service.js";
import { createAuditLog } from "../utils/audit.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { listUsersSchema } from "../utils/validations.js";

export const listUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = listUsersSchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query"),
      );
    }

    const { workspaceId } = req.user!;
    const result = await listUsers(workspaceId, parsed.data);
    sendSuccess(res, result, "Users fetched");
  } catch (error) {
    next(error);
  }
};

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId } = req.user!;
    const user = await createUser(workspaceId, req.body);

    createAuditLog({
      action: "USER_CREATED",
      userId,
      workspaceId,
      targetId: user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: {
        role: user.role,
        email: user.email,
        teamId: user.teamId,
      },
    });

    sendSuccess(res, { user }, "User created", 201);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params["id"];
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!userId) {
      return next(new BadRequestError("User ID is required"));
    }

    const { userId: actorId, workspaceId } = req.user!;
    const user = await updateUser(workspaceId, userId, req.body);

    createAuditLog({
      action: "USER_UPDATED",
      userId: actorId,
      workspaceId,
      targetId: user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: {
        role: user.role,
        email: user.email,
        teamId: user.teamId,
        isActive: user.isActive,
      },
    });

    sendSuccess(res, { user }, "User updated");
  } catch (error) {
    next(error);
  }
};

export const deactivateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params["id"];
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!userId) {
      return next(new BadRequestError("User ID is required"));
    }

    const { userId: actorId, workspaceId } = req.user!;
    const user = await deactivateUser(workspaceId, userId);

    createAuditLog({
      action: "USER_DEACTIVATED",
      userId: actorId,
      workspaceId,
      targetId: user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: {
        role: user.role,
        email: user.email,
      },
    });

    sendSuccess(res, { user }, "User deactivated");
  } catch (error) {
    next(error);
  }
};
