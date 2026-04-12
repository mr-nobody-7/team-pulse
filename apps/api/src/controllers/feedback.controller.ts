import type { NextFunction, Request, Response } from "express";
import { createFeedback } from "../services/feedback.service.js";
import type { CreateFeedbackInput } from "../types/index.js";
import { sendSuccess } from "../utils/response.js";

export const createFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, workspaceId } = req.user!;
    const feedback = await createFeedback(
      req.body as CreateFeedbackInput,
      userId,
      workspaceId,
    );

    sendSuccess(res, { feedback }, "Feedback submitted", 201);
  } catch (error) {
    next(error);
  }
};
