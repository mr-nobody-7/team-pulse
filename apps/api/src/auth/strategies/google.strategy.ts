import bcrypt from "bcrypt";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { prisma } from "../../lib/db.js";
import { saveGoogleTokens } from "../../integrations/google/google-calendar.service.js";

export interface GoogleAuthUser {
  userId: string;
  email: string;
  name: string;
  workspaceId: string;
  role: "USER" | "MANAGER" | "ADMIN";
  teamId: string | null;
  hasCalendarRefreshToken: boolean;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL?.trim() || "/auth/google/callback";

function getGoogleOauthEnv(): {
  clientId: string;
  clientSecret: string;
} {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    );
  }

  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  };
}

function profileDisplayName(profile: Profile, fallbackEmail: string): string {
  const trimmed = profile.displayName?.trim();
  if (trimmed) return trimmed;

  const given = profile.name?.givenName?.trim() ?? "";
  const family = profile.name?.familyName?.trim() ?? "";
  const combined = `${given} ${family}`.trim();
  if (combined) return combined;

  return fallbackEmail.split("@")[0] ?? "Google User";
}

function mapGoogleAuthUser(user: {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  role: "USER" | "MANAGER" | "ADMIN";
  teamId: string | null;
}): GoogleAuthUser {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    workspaceId: user.workspaceId,
    role: user.role,
    teamId: user.teamId,
    hasCalendarRefreshToken: false,
  };
}

async function findOrCreateGoogleUser(
  profile: Profile,
): Promise<GoogleAuthUser> {
  const email = profile.emails?.[0]?.value?.trim().toLowerCase();
  const googleId = profile.id?.trim();

  if (!email) {
    throw new Error("Google account email is required");
  }

  if (!googleId) {
    throw new Error("Google account id is required");
  }

  const existingUserByGoogleId = await prisma.user.findUnique({
    where: { googleId },
    select: {
      id: true,
      email: true,
      name: true,
      workspaceId: true,
      role: true,
      teamId: true,
      isActive: true,
    },
  });

  if (existingUserByGoogleId) {
    if (!existingUserByGoogleId.isActive) {
      throw new Error("Account is inactive");
    }

    return mapGoogleAuthUser(existingUserByGoogleId);
  }

  const existingUserByEmail = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      workspaceId: true,
      role: true,
      teamId: true,
      isActive: true,
      googleId: true,
    },
  });

  if (existingUserByEmail) {
    if (!existingUserByEmail.isActive) {
      throw new Error("Account is inactive");
    }

    if (
      existingUserByEmail.googleId &&
      existingUserByEmail.googleId !== googleId
    ) {
      throw new Error("Email is already linked to another Google account");
    }

    const linkedUser = await prisma.user.update({
      where: { id: existingUserByEmail.id },
      data: { googleId },
      select: {
        id: true,
        email: true,
        name: true,
        workspaceId: true,
        role: true,
        teamId: true,
      },
    });

    return mapGoogleAuthUser(linkedUser);
  }

  const name = profileDisplayName(profile, email);
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

  const user = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: `${name}'s Workspace` },
      select: { id: true },
    });

    return tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        workspaceId: workspace.id,
        googleId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        workspaceId: true,
        role: true,
        teamId: true,
      },
    });
  });

  return mapGoogleAuthUser(user);
}

export function configureGoogleStrategy(): void {
  const { clientId, clientSecret } = getGoogleOauthEnv();

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          const user = await findOrCreateGoogleUser(profile);

          if (!user) {
            done(new Error("Could not find or create user"));
            return;
          }

          if (refreshToken) {
            try {
              await saveGoogleTokens(user.userId, {
                access_token: accessToken,
                refresh_token: refreshToken,
                expiry_date: Date.now() + 60 * 60 * 1000,
                scope: "https://www.googleapis.com/auth/calendar",
              });
              user.hasCalendarRefreshToken = true;
            } catch (tokenError) {
              console.error(
                "[configureGoogleStrategy] Failed to persist Google tokens",
                {
                  userId: user.userId,
                  error:
                    tokenError instanceof Error
                      ? tokenError.message
                      : String(tokenError),
                },
              );
            }
          }

          done(null, user);
        } catch (error) {
          console.error(
            "[configureGoogleStrategy] Could not resolve OAuth user",
            {
              error: error instanceof Error ? error.message : String(error),
            },
          );
          done(new Error("Could not find or create user"));
        }
      },
    ),
  );
}
