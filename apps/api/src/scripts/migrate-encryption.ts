import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { decryptLegacy, encrypt } from "../utils/encryption.js";

const prisma = new PrismaClient({ accelerateUrl: "", log: [] });

async function migrateSlackTokens() {
  const records = await prisma.slackInstallation.findMany({
    select: { id: true, accessTokenEncrypted: true },
  });
  let migrated = 0;
  for (const record of records) {
    // Only migrate legacy CBC tokens (2 parts)
    if (record.accessTokenEncrypted.split(":").length === 2) {
      const plaintext = decryptLegacy(record.accessTokenEncrypted);
      const newEncrypted = encrypt(plaintext);
      await prisma.slackInstallation.update({
        where: { id: record.id },
        data: { accessTokenEncrypted: newEncrypted },
      });
      migrated++;
    }
  }
  console.log(`[migrate-encryption] Migrated ${migrated} of ${records.length} Slack tokens to AES-GCM`);
  await prisma.$disconnect();
}

migrateSlackTokens().catch((err) => {
  console.error("[migrate-encryption] Migration failed", err);
  process.exit(1);
});
