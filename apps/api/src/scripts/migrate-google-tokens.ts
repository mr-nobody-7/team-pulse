import "dotenv/config";
import crypto from "node:crypto";
import { Client } from "pg";

const ALGORITHM = "aes-256-cbc";

function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("Missing ENCRYPTION_KEY");
  }

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string");
  }

  return key;
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(payload: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedHex] = payload.split(":");

  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function isEncrypted(value: string): boolean {
  try {
    decrypt(value);
    return true;
  } catch {
    return false;
  }
}

async function migrateGoogleTokens(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  await client.connect();

  const result = await client.query<{
    id: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
  }>(
    'SELECT id, "accessTokenEncrypted", "refreshTokenEncrypted" FROM "UserGoogleToken"',
  );

  const records = result.rows;

  let migratedCount = 0;

  for (const record of records) {
    const updates: {
      accessTokenEncrypted?: string;
      refreshTokenEncrypted?: string;
    } = {};

    if (!isEncrypted(record.accessTokenEncrypted)) {
      updates.accessTokenEncrypted = encrypt(record.accessTokenEncrypted);
    }

    if (!isEncrypted(record.refreshTokenEncrypted)) {
      updates.refreshTokenEncrypted = encrypt(record.refreshTokenEncrypted);
    }

    if (Object.keys(updates).length > 0) {
      await client.query(
        'UPDATE "UserGoogleToken" SET "accessTokenEncrypted" = COALESCE($2, "accessTokenEncrypted"), "refreshTokenEncrypted" = COALESCE($3, "refreshTokenEncrypted") WHERE id = $1',
        [
          record.id,
          updates.accessTokenEncrypted ?? null,
          updates.refreshTokenEncrypted ?? null,
        ],
      );
      migratedCount += 1;
    }
  }

  await client.end();

  console.log(
    `[migrate-google-tokens] Migrated ${migratedCount} of ${records.length} records`,
  );
}

migrateGoogleTokens()
  .catch((error) => {
    console.error("[migrate-google-tokens] Migration failed", error);
    process.exitCode = 1;
  });
