import type { NextFunction, Request, Response } from "express";

import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
} from "../services/user.service.js";
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
    const { workspaceId } = req.user!;
    const user = await createUser(workspaceId, req.body);
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

    const { workspaceId } = req.user!;
    const user = await updateUser(workspaceId, userId, req.body);
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

    const { workspaceId } = req.user!;
    const user = await deactivateUser(workspaceId, userId);
    sendSuccess(res, { user }, "User deactivated");
  } catch (error) {
    next(error);
  }
};
