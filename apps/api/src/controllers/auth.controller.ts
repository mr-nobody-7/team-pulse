import type { Request, Response } from "express";
import { registerUserService, EmailInUseError, loginService, InvalidCredentialsError } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../utils/validations.js";

export const registerController = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  try {
    const result = await registerUserService(parsed.data);
    res.status(201).json({ message: "User registered successfully", user: result.user });
  } catch (error) {
    if (error instanceof EmailInUseError) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};


export const loginController = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  try {
    const result = await loginService(parsed.data);
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000 * 24 * 7, // 1 week
    })
    res.status(200).json({ message: "User logged in successfully", user: result.user});
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
