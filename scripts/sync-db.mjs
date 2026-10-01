import { execSync } from "child_process";

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && !dbUrl.includes("placeholder")) {
  console.log("🔄 [sync-db] Running Prisma db push to ensure tables exist...");
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
  console.log("ℹ️ [sync-db] Skipping db push/seed: DATABASE_URL not set or using local defaults.");
}
