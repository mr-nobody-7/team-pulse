-- Add nullable Google OAuth subject identifier to support safe account linking
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;

-- Enforce uniqueness across linked Google accounts
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
