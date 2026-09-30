import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl = "file:./prisma/dev.db";
const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
