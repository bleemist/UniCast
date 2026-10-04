import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Load .env if not already loaded in process.env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && !dbUrl.includes("placeholder")) {
  console.log("🔄 [sync-db] Running Prisma db push to ensure tables exist in target database...");
  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("🌱 [sync-db] Seeding initial database data...");
    execSync("node scripts/seed.mjs", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("✅ [sync-db] Database synchronization completed.");
  } catch (err) {
    console.warn("⚠️ [sync-db] Non-fatal notice: Could not push/seed database during this step:", err?.message || err);
  }
} else {
  console.log("ℹ️ [sync-db] Skipping db push/seed: DATABASE_URL not set or using placeholder.");
}
