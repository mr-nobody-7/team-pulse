import type { NextFunction, Request, Response } from "express";
import type { GoogleAuthUser } from "../auth/strategies/google.strategy.js";
import {
  getMeService,
  loginService,
  registerUserService,
  registerWorkspaceService,
} from "../services/auth.service.js";
import {
  hasCalendarAccess as hasCalendarAccessIntegration,
  revokeGoogleAccess as revokeGoogleAccessIntegration,
} from "../integrations/google/google-calendar.service.js";
import { prisma } from "../lib/db.js";
import { createAuditLog } from "../utils/audit.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  hashToken,
} from "../utils/jwt.js";
import { sendSuccess } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "strict",
  path: "/",
} as const;

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

function resolvePrimaryFrontendUrl(): string {
  const fromClientUrl = process.env.CLIENT_URL ?? "";
  const fromClientUrls = process.env.CLIENT_URLS ?? "";

  const configured = `${fromClientUrl},${fromClientUrls}`
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return configured[0] ?? "http://localhost:3000";
}

function resolveDashboardRedirectUrl(): string {
  const frontendUrl = resolvePrimaryFrontendUrl();
  return new URL("/dashboard", frontendUrl).toString();
}

function resolveSettingsConnectedRedirectUrl(): string {
  const frontendUrl = resolvePrimaryFrontendUrl();
  return new URL("/settings?calendar=connected", frontendUrl).toString();
}

function resolvePrivacyConsentRedirectUrl(): string {
  const frontendUrl = resolvePrimaryFrontendUrl();
  return new URL("/privacy-consent", frontendUrl).toString();
}

/**
 * Issue access and refresh tokens to the client
 * Access token: 15 minutes, stored as httpOnly cookie
 * Refresh token: 30 days, stored as httpOnly cookie with path=/auth/refresh
 */
async function issueTokens(
  res: Response,
  user: { id: string; workspaceId: string; role: string },
  req: Request,
) {
  // Generate short-lived access token (15 minutes)
  const accessToken = generateAccessToken(user.id, user.workspaceId, user.role);

  // Generate opaque refresh token
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  // Save hashed refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      userAgent: req.headers["user-agent"] ?? null,
      ipAddress: req.ip ?? null,
    },
  });

  // Set access token cookie (15 minutes)
  res.cookie("token", accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie (30 days, only sent to /auth/refresh)
  res.cookie("refresh_token", refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/auth/refresh",
  });
}

/**
 * Legacy function: issue single long-lived JWT cookie
 * Kept for backward compatibility with Google OAuth flow
 */
function issueAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 1000 * 24 * 7,
  });
}

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

    sendSuccess(
      res,
      { user: result.user },
      "User registered successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const registerWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await registerWorkspaceService(req.body);

    await issueTokens(res, result.user, req);

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
        leaveTypes: req.body.leaveTypes,
      },
    });

    sendSuccess(
      res,
      { user: result.user },
      "Workspace created successfully",
      201,
    );
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

    await issueTokens(res, result.user, req);

    createAuditLog({
      action: "USER_LOGIN",
      userId: result.user.id,
      workspaceId: result.user.workspaceId,
      targetId: result.user.id,
      targetType: "User",
      ipAddress: req.ip,
      metadata: { email: result.user.email },
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

export const googleCallbackController = (req: Request, res: Response) => {
  const oauthUser = (req as Request & { user?: GoogleAuthUser }).user;
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const isCalendarConnectFlow = state === "calendar_connect";

  if (!oauthUser) {
    res.redirect(
      isCalendarConnectFlow
        ? resolveSettingsConnectedRedirectUrl()
        : resolveDashboardRedirectUrl(),
    );
    return;
  }

  const resolvedUserId = oauthUser.userId;
  console.info("[googleCallbackController] OAuth user resolved", {
    id: resolvedUserId,
    email: oauthUser.email,
  });

  const token = generateToken({
    userId: resolvedUserId,
    workspaceId: oauthUser.workspaceId,
    role: oauthUser.role,
    teamId: oauthUser.teamId,
  });

  issueAuthCookie(res, token);

  createAuditLog({
    action: "USER_LOGIN",
    userId: oauthUser.userId,
    workspaceId: oauthUser.workspaceId,
    targetId: oauthUser.userId,
    targetType: "User",
    ipAddress: req.ip,
    metadata: {
      email: oauthUser.email,
      provider: "google",
    },
  });

  if (!isCalendarConnectFlow && !oauthUser.privacyAcceptedAt) {
    res.redirect(resolvePrivacyConsentRedirectUrl());
    return;
  }

  res.redirect(
    isCalendarConnectFlow
      ? resolveSettingsConnectedRedirectUrl()
      : resolveDashboardRedirectUrl(),
  );
};

export const googleFailureController = (req: Request, res: Response) => {
  createAuditLog({
    action: "USER_LOGIN_FAILED",
    ipAddress: req.ip,
    metadata: { provider: "google" },
  });

  const frontendUrl = resolvePrimaryFrontendUrl();
  res.redirect(
    new URL("/login?error=google_oauth_failed", frontendUrl).toString(),
  );
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

export const calendarStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendSuccess(res, { connected: false }, "Calendar status fetched");
      return;
    }

    const connected = await hasCalendarAccessIntegration(userId);
    sendSuccess(res, { connected }, "Calendar status fetched");
  } catch (error) {
    next(error);
  }
};

export const calendarDisconnectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendSuccess(res, null, "Calendar disconnected");
      return;
    }

    await revokeGoogleAccessIntegration(userId);
    sendSuccess(res, null, "Calendar disconnected");
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response) => {
  // Clear both access and refresh token cookies
  res.clearCookie("token", AUTH_COOKIE_OPTIONS);
  res.clearCookie("refresh_token", { ...AUTH_COOKIE_OPTIONS, path: "/auth/refresh" });

  // Revoke refresh token if user is authenticated
  if (req.user?.userId) {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, userId: req.user.userId },
        data: { revokedAt: new Date() },
      });
    }
  }

  sendSuccess(res, null, "Logged out successfully");
};

/**
 * Refresh endpoint: validates refresh token and issues new access token + refresh token
 */
export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Hash the token and look up in database
    const tokenHash = hashToken(refreshToken);
    const savedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!savedToken) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Check if token was revoked (possible replay attack)
    if (savedToken.revokedAt) {
      // Revoke ALL refresh tokens for this user (security incident)
      await prisma.refreshToken.updateMany({
        where: { userId: savedToken.userId },
        data: { revokedAt: new Date() },
      });
      return next(new UnauthorizedError("Authentication required"));
    }

    // Check if token has expired
    if (savedToken.expiresAt < new Date()) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Verify user is still active
    if (!savedToken.user.isActive) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Mark current refresh token as revoked (rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens
    await issueTokens(res, savedToken.user, req);

    sendSuccess(res, null, "Tokens refreshed successfully");
  } catch (error) {
    next(error);
  }
};
