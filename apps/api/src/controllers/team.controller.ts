import type { NextFunction, Request, Response } from "express";
import {
  createTeam,
  deleteTeam,
  listTeams,
  updateTeam,
} from "../services/team.service.js";
import { BadRequestError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

export const listTeamsController = async (req: Request, res: Response) => {
  const { workspaceId } = req.user!;
  const teams = await listTeams(workspaceId);
  sendSuccess(res, teams, "Teams fetched");
};

export const createTeamController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { workspaceId } = req.user!;
    const team = await createTeam(workspaceId, (req.body as { name: string }).name);
    sendSuccess(res, team, "Team created", 201);
  } catch (error) {
    next(error);
  }
};

export const updateTeamController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params["id"];
    const teamId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!teamId) {
      return next(new BadRequestError("Team ID is required"));
    }

    const { workspaceId } = req.user!;
    const team = await updateTeam(
      workspaceId,
      teamId,
      (req.body as { name: string }).name,
    );

    sendSuccess(res, team, "Team updated");
  } catch (error) {
    next(error);
  }
};

export const deleteTeamController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params["id"];
    const teamId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!teamId) {
      return next(new BadRequestError("Team ID is required"));
    }

    const { workspaceId } = req.user!;
    await deleteTeam(workspaceId, teamId);
    sendSuccess(res, null, "Team deleted");
  } catch (error) {
    next(error);
  }
};
