import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@/types";

/**
 * Attempts to ensure the database tables exist.
 * If a query fails because tables are missing, runs a sync push.
 */
async function ensureDatabaseReady(): Promise<{ ready: boolean; error?: string }> {
  try {
    // Quick connectivity + schema check — just count users
    await prisma.user.count();
    return { ready: true };
  } catch (err: any) {
    const msg = err?.message || "";
    const code = err?.code || "";

    // Table doesn't exist → try to push schema
    if (
      code === "P2021" ||
      msg.includes("does not exist") ||
      msg.includes("no such table") ||
      msg.includes("SQLITE_ERROR")
    ) {
      try {
        const { execSync } = require("child_process");
        execSync("npx prisma db push --skip-generate --accept-data-loss", {
          cwd: process.cwd(),
          timeout: 30000,
          stdio: "pipe",
        });
        // Verify after push
        await prisma.user.count();
        return { ready: true };
      } catch (pushErr: any) {
        return {
          ready: false,
          error: `Database tables missing and auto-migration failed: ${pushErr?.message?.split("\n")[0] || "Unknown error"}`,
        };
      }
    }

    // Connection failure
    if (code === "P1001" || msg.includes("Can't reach database")) {
      return {
        ready: false,
        error: "Cannot connect to database. Check your DATABASE_URL environment variable.",
      };
    }

    // Provider mismatch (SQLite schema vs PostgreSQL URL or vice versa)
    if (
      msg.includes("the URL must start with the protocol") ||
      msg.includes("Error validating datasource")
    ) {
      return {
        ready: false,
        error: "Database provider mismatch: Prisma schema provider does not match DATABASE_URL. Run `npx prisma generate` after updating your schema.",
      };
    }

    return {
      ready: false,
      error: `Database error: ${msg.split("\n")[0]}`,
    };
  }
}

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    let email: string;
    let password: string;
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Send JSON with email and password." },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Ensure database is ready
    const dbCheck = await ensureDatabaseReady();
    if (!dbCheck.ready) {
      return NextResponse.json(
        { error: dbCheck.error },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find the user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 4. Auto-bootstrap default administrator if database is empty
    if (
      !user &&
      (normalizedEmail === "admin@unicast.radio" ||
        normalizedEmail === "admin@kyu.ac.ug") &&
      password === "Admin@Kyambogo107"
    ) {
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
              avatar:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80",
            },
          });
          console.log(
            `🌱 Auto-bootstrapped default admin user: ${normalizedEmail}`
          );
        }
      } catch (seedErr) {
        console.warn("Could not auto-bootstrap default admin:", seedErr);
      }
    }

    // 5. Validate credentials
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptErr) {
      console.error("bcrypt comparison error:", bcryptErr);
      return NextResponse.json(
        { error: "Authentication service error. Please try again." },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6. Sign JWT and set cookie
    let token: string;
    try {
      token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        avatar: user.avatar,
      });
    } catch (jwtErr) {
      console.error("JWT signing error:", jwtErr);
      return NextResponse.json(
        { error: "Session creation failed. Please try again." },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      {
        error:
          error?.message?.split("\n")[0] ||
          "Internal server error. Check the server logs.",
      },
      { status: 500 }
    );
  }
}
