import bcrypt from "bcrypt";
import { prisma } from "../lib/db.js";
import type {
  RegisterInput,
  RegisterResult,
  LoginInput,
} from "../types/index.js";
import { generateToken } from "../utils/jwt.js";

export class EmailInUseError extends Error {
  constructor() {
    super("Email already in use");
    this.name = "EmailInUseError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export const registerUserService = async (
  input: RegisterInput,
): Promise<RegisterResult> => {
  const { workspace_name, name, email, password } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new EmailInUseError();
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: workspace_name },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        workspaceId: workspace.id,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { workspace, user: safeUser };
  });
};

export const loginService = async (input: LoginInput) => {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new InvalidCredentialsError();
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
