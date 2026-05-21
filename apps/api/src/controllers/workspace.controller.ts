import type { NextFunction, Request, Response } from "express";
import type { TransferOwnershipInput } from "../types/index.js";
import { listWorkspaceMembers, transferWorkspaceOwnership } from "../services/workspace.service.js";
import { ForbiddenError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

export const listWorkspaceMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const actor = req.user!;

    if (actor.workspaceId !== workspaceId) {
      throw new ForbiddenError("You cannot access another workspace");
    }

    const members = await listWorkspaceMembers(workspaceId);
    sendSuccess(res, { members }, "Workspace members fetched");
  } catch (error) {
    next(error);
  }
};

export const transferWorkspaceOwnershipController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const actor = req.user!;

    if (actor.workspaceId !== workspaceId) {
      throw new ForbiddenError("You cannot modify another workspace");
    }

    await transferWorkspaceOwnership(
      actor.userId,
      workspaceId,
      req.body as TransferOwnershipInput,
      req.ip,
    );

    sendSuccess(res, null, "Workspace ownership transferred");
  } catch (error) {
    next(error);
  }
};
