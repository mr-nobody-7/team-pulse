import { doubleCsrf } from "csrf-csrf";
import type { Request } from "express";

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET!,
  cookieName: "__Host-psifi.x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: Request) => req.headers["x-csrf-token"] as string,
  getSessionIdentifier: (req: Request) => req.ip || "anonymous",
});

export { doubleCsrfProtection };
