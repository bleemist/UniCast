import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/universities - Public list of universities (active only for listeners, all for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("stats") === "true";
    const session = await getServerSession();

    // Public only gets active universities sorted alphabetically
    if (!session || !includeStats) {
      const universities = await prisma.university.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          shortName: true,
          location: true,
          country: true,
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ success: true, universities });
    }

    // Admin with stats: include listener session counts
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: {
            listenerSessions: true,
            listenerEvents: true,
          },
        },
        listenerSessions: {
          select: {
            sessionDuration: true,
            lastSeenAt: true,
            anonymousListenerId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = universities.map((u) => {
      const uniqueListeners = new Set(u.listenerSessions.map((s) => s.anonymousListenerId)).size;
      const totalDuration = u.listenerSessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0);
      const avgDuration = u.listenerSessions.length > 0 ? Math.round(totalDuration / u.listenerSessions.length / 60) : 0;
      
      const sortedLastSeen = u.listenerSessions
        .map((s) => s.lastSeenAt.getTime())
        .sort((a, b) => b - a);
      const lastActivity = sortedLastSeen.length > 0 ? new Date(sortedLastSeen[0]) : null;

      return {
        id: u.id,
        name: u.name,
        shortName: u.shortName,
        location: u.location,
        country: u.country,
        isActive: u.isActive,
        listenerCount: uniqueListeners,
        sessionCount: u._count.listenerSessions,
        totalDurationSeconds: totalDuration,
        avgDurationMinutes: avgDuration,
        lastActivity,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ success: true, universities: formatted });
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}

// POST /api/universities - Admin creates a new university
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.role, "universities")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, shortName, location, country } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "University name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedShort = shortName?.trim() || null;

    // Check duplicate name
    const existing = await prisma.university.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `University '${trimmedName}' already exists` },
        { status: 409 }
      );
    }

    const university = await prisma.university.create({
      data: {
        name: trimmedName,
        shortName: trimmedShort,
        location: location?.trim() || "Kampala",
        country: country?.trim() || "Uganda",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, university });
  } catch (error) {
    console.error("Failed to create university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create university" },
      { status: 500 }
    );
  }
}
