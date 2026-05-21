import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

const roleRanks: Record<string, number> = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new UnauthorizedError());
    }

    const userRank = roleRanks[user.role] ?? 0;
    const isAllowed = allowedRoles.some((role) => userRank >= (roleRanks[role] ?? 0));

    if (!isAllowed) {
      return next(new ForbiddenError());
    }
    next();
  };
};
