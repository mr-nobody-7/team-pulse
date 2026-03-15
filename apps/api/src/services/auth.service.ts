import bcrypt from "bcrypt";
import { prisma } from "../lib/db.js";
import type {
  LoginInput,
  RegisterInput,
  RegisterResult,
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

export const registerUserService = async (
  input: RegisterInput,
): Promise<RegisterResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const workspaceName = input.workspace_name.trim();
  const password = input.password;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new EmailInUseError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

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
        { workspaceId: workspace.id, type: "VACATION", isActive: true },
        { workspaceId: workspace.id, type: "SICK", isActive: true },
        { workspaceId: workspace.id, type: "PERSONAL", isActive: true },
        { workspaceId: workspace.id, type: "CASUAL", isActive: true },
      ],
      skipDuplicates: true,
    });

    const { passwordHash: _, ...safeUser } = user;
    return { workspace, user: safeUser };
  });
};

export const loginService = async (input: LoginInput) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new InvalidCredentialsError();
  }

  if (!user.isActive) {
    throw new ForbiddenError("Account is inactive");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new InvalidCredentialsError();
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
      workspace: { select: { id: true, name: true, createdAt: true } },
    },
  });
  if (!user) throw new UnauthorizedError("User not found");
  return user;
};
