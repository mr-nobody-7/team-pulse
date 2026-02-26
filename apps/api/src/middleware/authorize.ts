import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
};
