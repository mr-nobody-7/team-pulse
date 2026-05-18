import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

/**
 * Generate a short-lived access token (15 minutes)
 * Used for API authentication
 */
export const generateAccessToken = (
  userId: string,
  workspaceId: string,
  role: string,
) => {
  return jwt.sign(
    { userId, workspaceId, role, type: "access" },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
};

/**
 * Generate a long-lived opaque refresh token
 * This is a cryptographically random 64-byte hex string (NOT a JWT)
 * Store the HASH in the database, send the PLAIN token to the client
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Hash a token using SHA-256
 * Used to securely store refresh tokens in the database
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Legacy function: generate 7-day JWT (deprecated, kept for backward compatibility)
 * Use generateAccessToken + generateRefreshToken instead
 */
export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
