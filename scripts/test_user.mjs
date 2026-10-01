import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log("Total users in DB:", users.length);
    for (const u of users) {
      const match = await bcrypt.compare("Admin@Kyambogo107", u.passwordHash);
      console.log(`User: ${u.email} | Role: ${u.role} | Password match: ${match}`);
    }
  } catch (err) {
    console.error("Error querying DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
