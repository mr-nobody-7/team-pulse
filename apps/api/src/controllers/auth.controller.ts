import type { NextFunction, Request, Response } from "express";
import {
  loginService,
  getMeService,
  registerUserService,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { createAuditLog } from "../utils/audit.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "strict",
} as const;

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await registerUserService(req.body);

    createAuditLog({
      action: "USER_REGISTERED",
      userId: result.user.id,
      workspaceId: result.user.workspaceId,
      targetId: result.user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: {
        email: result.user.email,
        name: result.user.name,
        workspaceName: result.workspace.name,
      },
    });

    sendSuccess(res, { user: result.user }, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loginService(req.body);

    createAuditLog({
      action: "USER_LOGIN",
      userId: result.user.id,
      workspaceId: result.user.workspaceId,
      targetId: result.user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: { email: result.user.email },
    });

    res.cookie("token", result.token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000 * 24 * 7, // 1 week
    });
    sendSuccess(res, { user: result.user }, "User logged in successfully");
  } catch (error) {
    // Record failed login attempts regardless of why they failed
    createAuditLog({
      action: "USER_LOGIN_FAILED",
      ipAddress: req.ip,
      metadata: { email: req.body.email as string },
    });
    next(error);
  }
};
export const meController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.user is guaranteed by authenticate middleware
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = await getMeService(req.user!.userId);
    sendSuccess(res, { user }, "User fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const logoutController = (_req: Request, res: Response) => {
  res.clearCookie("token", AUTH_COOKIE_OPTIONS);
  sendSuccess(res, null, "Logged out successfully");
};