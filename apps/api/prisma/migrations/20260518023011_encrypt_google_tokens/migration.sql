-- AlterTable
ALTER TABLE "UserGoogleToken" RENAME COLUMN "accessToken" TO "accessTokenEncrypted";

-- AlterTable
ALTER TABLE "UserGoogleToken" RENAME COLUMN "refreshToken" TO "refreshTokenEncrypted";
