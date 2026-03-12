import type { Request, Response } from "express";
import { listTeams } from "../services/team.service.js";
import { sendSuccess } from "../utils/response.js";

export const listTeamsController = async (req: Request, res: Response) => {
  const { workspaceId } = req.user!;
  const teams = await listTeams(workspaceId);
  sendSuccess(res, teams, "Teams fetched");
};
