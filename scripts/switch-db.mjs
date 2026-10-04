import fs from "fs";
import path from "path";

// 1. Helper to load .env when running script in standalone Node process
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

// 2. Determine target provider
let target = process.argv[2]?.toLowerCase();

if (!target) {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    target = "postgresql";
  } else if (dbUrl.startsWith("mysql://")) {
    target = "mysql";
  } else {
    target = "sqlite";
  }
}

if (!["sqlite", "postgresql", "postgres", "mysql"].includes(target)) {
  console.log("Usage: node scripts/switch-db.mjs [sqlite|postgresql|mysql]");
  process.exit(1);
}

const provider =
  target === "sqlite"
    ? "sqlite"
    : target === "mysql"
    ? "mysql"
    : "postgresql";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf-8");

// 3. Update datasource block with appropriate provider and directUrl support
if (provider === "postgresql") {
  schema = schema.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/,
    `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`
  );
} else if (provider === "sqlite") {
  schema = schema.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/,
    `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`
  );
} else if (provider === "mysql") {
  schema = schema.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/,
    `datasource db {\n  provider = "mysql"\n  url      = env("DATABASE_URL")\n}`
  );
}

fs.writeFileSync(schemaPath, schema, "utf-8");
console.log(`✅ Successfully configured Prisma datasource for: "${provider}"`);
