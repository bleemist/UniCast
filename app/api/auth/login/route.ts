import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@/types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Auto-bootstrap default administrator if database is connected but unseeded
    if (!user && (normalizedEmail === "admin@unicast.radio" || normalizedEmail === "admin@kyu.ac.ug") && password === "Admin@Kyambogo107") {
      try {
        const userCount = await prisma.user.count();
        if (userCount === 0) {
          const passwordHash = await bcrypt.hash("Admin@Kyambogo107", 10);
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              passwordHash,
              name: "UniCast Director",
              role: "SUPER_ADMIN",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
            },
          });
          console.log(`🌱 Auto-bootstrapped default admin user: ${normalizedEmail}`);
        }
      } catch (seedErr) {
        console.warn("Could not auto-bootstrap default admin:", seedErr);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const msg = error?.message || "";
    let userFriendlyError = "Internal server error";

    if (msg.includes("the URL must start with the protocol 'file:'") || msg.includes("Error validating datasource")) {
      userFriendlyError = "Database provider mismatch: Prisma was compiled for SQLite but DATABASE_URL is PostgreSQL. Redeploying now will auto-switch to PostgreSQL.";
    } else if (error?.code === "P2021" || msg.includes("does not exist") || msg.includes("no such table")) {
      userFriendlyError = "Database tables are not initialized yet. Visit /api/admin/setup to initialize tables and admin credentials.";
    } else if (error?.code === "P1001" || msg.includes("Can't reach database")) {
      userFriendlyError = "Cannot connect to database. Please check your DATABASE_URL on Render.";
    } else if (msg) {
      userFriendlyError = `Database error: ${msg.split("\n")[0]}`;
    }

    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}
