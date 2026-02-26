import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/index.js";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};
