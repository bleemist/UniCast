import fs from "fs";
import path from "path";

const target = process.argv[2]?.toLowerCase();
if (!target || !["sqlite", "postgresql", "postgres"].includes(target)) {
  console.log("Usage: node scripts/switch-db.mjs [sqlite|postgresql]");
  process.exit(1);
}

const provider = target === "sqlite" ? "sqlite" : "postgresql";
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

let schema = fs.readFileSync(schemaPath, "utf-8");
schema = schema.replace(
  /datasource\s+db\s*\{[^}]*provider\s*=\s*"[^"]*"/,
  `datasource db {\n  provider = "${provider}"`
);

fs.writeFileSync(schemaPath, schema, "utf-8");
console.log(`✅ Successfully switched Prisma provider to: "${provider}"`);
