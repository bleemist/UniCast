import fs from "fs";
import path from "path";

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
  console.log("Usage: node scripts/switch-db.mjs [sqlite|postgresql]");
  process.exit(1);
}

const provider = target === "sqlite" ? "sqlite" : (target === "mysql" ? "mysql" : "postgresql");
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

let schema = fs.readFileSync(schemaPath, "utf-8");
schema = schema.replace(
  /datasource\s+db\s*\{[^}]*provider\s*=\s*"[^"]*"/,
  `datasource db {\n  provider = "${provider}"`
);

fs.writeFileSync(schemaPath, schema, "utf-8");
console.log(`✅ Successfully set Prisma provider to: "${provider}"`);
