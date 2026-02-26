import type { NextFunction, Request, Response } from "express";
import { loginService, registerUserService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await registerUserService(req.body);
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
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000 * 24 * 7, // 1 week
    });
    sendSuccess(res, { user: result.user }, "User logged in successfully");
  } catch (error) {
    next(error);
  }
};
