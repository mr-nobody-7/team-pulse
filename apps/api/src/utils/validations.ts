import z from "zod";

export const registerSchema = z.object({
  workspace_name: z
    .string()
    .min(3, "Workspace name is required")
    .max(50, "Workspace name must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const applyLeaveSchema = z.object({
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  start_session: z.enum(["FULL_DAY", "MORNING_HALF", "SECOND_HALF"], {
    error: "Invalid start session",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  end_session: z.enum(["FULL_DAY", "MORNING_HALF", "SECOND_HALF"], {
    error: "Invalid end session",
  }),
  type: z.enum(["sick", "vacation", "personal"], {
    error: "Invalid leave type",
  }),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

