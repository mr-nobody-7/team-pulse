import { prisma } from "../lib/db.js";
import type { CreateFeedbackInput } from "../types/index.js";

export const createFeedback = async (
  input: CreateFeedbackInput,
  userId: string,
  workspaceId: string,
) => {
  return prisma.feedbackEntry.create({
    data: {
      message: input.message,
      userId,
      workspaceId,
    },
    select: {
      id: true,
      message: true,
      userId: true,
      workspaceId: true,
      createdAt: true,
    },
  });
};
