import z from "zod";

export const registerSchema = z.object({
  workspace_name: z
    .string()
    .trim()
    .min(3, "Workspace name is required")
    .max(50, "Workspace name must be less than 50 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const applyLeaveSchema = z.object({
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  start_session: z.enum(["FULL_DAY", "FIRST_HALF", "SECOND_HALF"], {
    error: "Invalid start session",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  end_session: z.enum(["FULL_DAY", "FIRST_HALF", "SECOND_HALF"], {
    error: "Invalid end session",
  }),
  type: z.enum(["VACATION", "SICK", "PERSONAL", "CASUAL"], {
    error: "Invalid leave type",
  }),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

export const listLeaveSchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"], {
      error: "Invalid status value",
    })
    .optional(),
  team_id: z.string().optional(),
  page: z.coerce
    .number({ error: "page must be a number" })
    .int("page must be an integer")
    .min(1, "page must be at least 1")
    .default(1),
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(50, "limit must not exceed 50")
    .default(10),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    error: "Status must be APPROVED or REJECTED",
  }),
  comment: z
    .string()
    .max(500, "Comment must be less than 500 characters")
    .optional(),
});

export const reportsAnalyticsSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be in YYYY-MM format")
    .default(new Date().toISOString().slice(0, 7)),
  team_id: z.string().optional(),
});

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name is required")
    .max(100, "Team name must be less than 100 characters"),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name is required")
    .max(100, "Team name must be less than 100 characters"),
});

export const listUsersSchema = z.object({
  role: z.enum(["USER", "MANAGER", "ADMIN"]).optional(),
  team_id: z.string().optional(),
  is_active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["USER", "MANAGER", "ADMIN"]),
  team_id: z.string().optional(),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
      .optional(),
    role: z.enum(["USER", "MANAGER", "ADMIN"]).optional(),
    team_id: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listAuditLogsSchema = z.object({
  action: z
    .enum([
      "USER_REGISTERED",
      "USER_LOGIN",
      "USER_LOGIN_FAILED",
      "LEAVE_APPLIED",
      "LEAVE_APPROVED",
      "LEAVE_REJECTED",
      "LEAVE_CANCELLED",
    ])
    .optional(),
  user_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

