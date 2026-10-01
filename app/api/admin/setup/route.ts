import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    databaseUrlConfigured: !!process.env.DATABASE_URL,
    provider: process.env.DATABASE_URL?.startsWith("postgres")
      ? "postgresql"
      : process.env.DATABASE_URL?.startsWith("mysql")
      ? "mysql"
      : "sqlite",
  };

  try {
    // 1. Check if database tables exist
    let tablesExist = false;
    try {
      await prisma.user.count();
      tablesExist = true;
    } catch (tblErr: any) {
      console.warn("Tables missing, attempting automated db push...", tblErr?.message);
      try {
        execSync("npx prisma db push --skip-generate --accept-data-loss", {
          stdio: "inherit",
          env: process.env,
        });
        tablesExist = true;
      } catch (pushErr: any) {
        diagnostics.pushError = pushErr?.message || String(pushErr);
      }
    }
    diagnostics.tablesExist = tablesExist;

    // 2. Check and ensure default admin user exists
    const passwordHash = await bcrypt.hash("Admin@Kyambogo107", 10);
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@unicast.radio" },
      update: { passwordHash, role: "SUPER_ADMIN" },
      create: {
        email: "admin@unicast.radio",
        passwordHash,
        name: "UniCast Director",
        role: "SUPER_ADMIN",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
      },
    });

    await prisma.user.upsert({
      where: { email: "admin@kyu.ac.ug" },
      update: { passwordHash, role: "SUPER_ADMIN" },
      create: {
        email: "admin@kyu.ac.ug",
        passwordHash,
        name: "Kyambogo Lead Radio Admin",
        role: "SUPER_ADMIN",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
      },
    });

    const totalUsers = await prisma.user.count();
    diagnostics.totalUsers = totalUsers;
    diagnostics.defaultAdminReady = true;

    return NextResponse.json({
      status: "ready",
      message: "UniCast database and administrator credentials verified successfully.",
      diagnostics,
      loginUrl: "/admin/login",
      defaultCredentials: {
        email: "admin@unicast.radio",
        password: "Admin@Kyambogo107",
      },
    });
  } catch (error: any) {
    console.error("Setup diagnostic error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error?.message || String(error),
        diagnostics,
      },
      { status: 500 }
    );
  }
}
