import type { Request, Response } from "express";
import { registerUserService, EmailInUseError } from "../services/auth.service.js";
import { registerSchema } from "../utils/validations.js";

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
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

