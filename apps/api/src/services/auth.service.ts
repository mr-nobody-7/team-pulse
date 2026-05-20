import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import type {
  LoginInput,
  RegisterInput,
  RegisterResult,
  RegisterWorkspaceInput,
  SafeUser,
} from "../types/index.js";
import {
  AppError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors.js";
import { generateToken } from "../utils/jwt.js";

export class EmailInUseError extends AppError {
  constructor() {
    super(409, "Email already in use");
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, "Invalid credentials");
  }
}

const ALL_WORKSPACE_LEAVE_TYPES: { type: string; label: string }[] = [
  { type: "VACATION", label: "Earned Leave" },
  { type: "SICK", label: "Sick Leave" },
  { type: "PERSONAL", label: "Comp Off" },
  { type: "CASUAL", label: "Casual Leave" },
];

function isEmailUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (typeof target === "string") {
    return target.toLowerCase().includes("email");
  }

  if (Array.isArray(target)) {
    return target.some(
      (field) =>
        typeof field === "string" && field.toLowerCase().includes("email"),
    );
  }

  return false;
}

export const registerUserService = async (
  input: RegisterInput,
): Promise<RegisterResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const workspaceName = input.workspace_name.trim();
  const password = input.password;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
  });
  if (existingUser) {
    throw new EmailInUseError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName },
      });

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      await tx.workspaceLeaveType.createMany({
        data: [
          {
            workspaceId: workspace.id,
            type: "VACATION",
            label: "Earned Leave",
            isActive: true,
          },
          {
            workspaceId: workspace.id,
            type: "SICK",
            label: "Sick Leave",
            isActive: true,
          },
          {
            workspaceId: workspace.id,
            type: "PERSONAL",
            label: "Comp Off",
            isActive: true,
          },
          {
            workspaceId: workspace.id,
            type: "CASUAL",
            label: "Casual Leave",
            isActive: true,
          },
        ],
        skipDuplicates: true,
      });

      const { passwordHash: _, ...safeUser } = user;
      return { workspace, user: safeUser };
    });
  } catch (error) {
    if (isEmailUniqueConstraintError(error)) {
      throw new EmailInUseError();
    }

    throw error;
  }
};

export const registerWorkspaceService = async (
  input: RegisterWorkspaceInput,
) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const workspaceName = input.workspaceName.trim();
  const password = input.password;
  const selectedLeaveTypes = new Set(input.leaveTypes);

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
  });
  if (existingUser) {
    throw new EmailInUseError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let result: {
    workspace: { id: string; name: string; createdAt: Date };
    user: SafeUser;
  };

  try {
    result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName },
      });

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      await tx.workspaceLeaveType.createMany({
        data: ALL_WORKSPACE_LEAVE_TYPES.map(({ type, label }) => ({
          workspaceId: workspace.id,
          type,
          label,
          isActive: selectedLeaveTypes.has(type),
        })),
        skipDuplicates: true,
      });

      const { passwordHash: _, ...safeUser } = user;
      return { workspace, user: safeUser };
    });
  } catch (error) {
    if (isEmailUniqueConstraintError(error)) {
      throw new EmailInUseError();
    }

    throw error;
  }

  return result;
};

export const loginService = async (input: LoginInput) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt comparison — use a dummy hash 
  // if user not found to equalize timing
  const DUMMY_HASH = '$2b$10$invalidhashfortimingequalisation';
  const passwordToCheck = user?.passwordHash || DUMMY_HASH;
  const isValid = await bcrypt.compare(password, passwordToCheck);

  if (!user || !isValid) {
    throw new InvalidCredentialsError();
  }

  // Only check isActive AFTER password verification
  if (!user.isActive) {
    throw new ForbiddenError(
      'This account is no longer active. ' +
      'Please contact your workspace admin or ' +
      'support@teamfore.com for assistance.'
    );
  }

  const token = generateToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    teamId: user.teamId,
    role: user.role,
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
};

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      workspaceId: true,
      teamId: true,
      createdAt: true,
      workspace: {
        select: {
          id: true,
          name: true,
          country: true,
          timezone: true,
          createdAt: true,
        },
      },
    },
  });
  if (!user) throw new UnauthorizedError("User not found");
  return user;
};
