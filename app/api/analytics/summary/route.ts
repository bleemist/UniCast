import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const now = new Date();

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (range === "yesterday") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Active concurrent listeners (lastSeenAt within past 2 minutes)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const activeSessions = await prisma.listenerSession.findMany({
      where: { lastSeenAt: { gte: twoMinutesAgo } },
      select: { anonymousListenerId: true },
    });
    const activeListeners = new Set(activeSessions.map((s) => s.anonymousListenerId)).size;

    // Filter criteria for sessions in this date range
    const sessionWhere: Record<string, unknown> = {};
    if (startDate && endDate) {
      sessionWhere.sessionStartedAt = { gte: startDate, lt: endDate };
    } else if (startDate) {
      sessionWhere.sessionStartedAt = { gte: startDate };
    }

    // Fetch sessions in range
    const sessions = await prisma.listenerSession.findMany({
      where: sessionWhere,
      include: {
        university: {
          select: { id: true, name: true, shortName: true },
        },
      },
      orderBy: { sessionStartedAt: "asc" },
    });

    const totalSessions = sessions.length;
    const uniqueListenerIds = new Set(sessions.map((s) => s.anonymousListenerId));
    const totalListeners = uniqueListenerIds.size;

    const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0);
    const avgSessionDurationSeconds =
      totalSessions > 0 ? Math.round(totalDurationSeconds / totalSessions) : 0;

    // University distribution
    const uniMap: Record<
      string,
      {
        universityId: string;
        universityName: string;
        shortName: string | null;
        listenerIds: Set<string>;
        sessionCount: number;
        totalDuration: number;
        lastSeenAt: Date | null;
      }
    > = {};

    for (const s of sessions) {
      const uId = s.universityId || "unknown";
      const uName = s.university ? s.university.name : "Unspecified Campus";
      const short = s.university ? s.university.shortName : null;

      if (!uniMap[uId]) {
        uniMap[uId] = {
          universityId: uId,
          universityName: uName,
          shortName: short,
          listenerIds: new Set<string>(),
          sessionCount: 0,
          totalDuration: 0,
          lastSeenAt: null,
        };
      }

      uniMap[uId].listenerIds.add(s.anonymousListenerId);
      uniMap[uId].sessionCount += 1;
      uniMap[uId].totalDuration += s.sessionDuration || 0;
      if (!uniMap[uId].lastSeenAt || s.lastSeenAt > uniMap[uId].lastSeenAt!) {
        uniMap[uId].lastSeenAt = s.lastSeenAt;
      }
    }

    const universityAudience = Object.values(uniMap)
      .map((item) => {
        const listeners = item.listenerIds.size;
        const avgDurationMinutes =
          item.sessionCount > 0
            ? Math.round(item.totalDuration / item.sessionCount / 60)
            : 0;
        const percentage =
          totalSessions > 0
            ? Number(((item.sessionCount / totalSessions) * 100).toFixed(1))
            : 0;

        return {
          universityId: item.universityId,
          universityName: item.universityName,
          shortName: item.shortName,
          listeners,
          sessions: item.sessionCount,
          avgDurationMinutes,
          percentage,
          lastSeenAt: item.lastSeenAt ? item.lastSeenAt.toISOString() : null,
        };
      })
      .sort((a, b) => b.listeners - a.listeners);

    const universitiesReached = Object.keys(uniMap).filter((k) => k !== "unknown").length;

    // Trends grouping (daily buckets)
    const trendsMap: Record<string, { sessions: number; listeners: Set<string> }> = {};
    for (const s of sessions) {
      const d = s.sessionStartedAt.toISOString().split("T")[0];
      if (!trendsMap[d]) {
        trendsMap[d] = { sessions: 0, listeners: new Set() };
      }
      trendsMap[d].sessions += 1;
      trendsMap[d].listeners.add(s.anonymousListenerId);
    }

    const listeningTrends = Object.keys(trendsMap)
      .sort()
      .map((dateStr) => {
        const parts = dateStr.split("-");
        const formattedLabel = `${parts[1]}/${parts[2]}`;
        return {
          label: formattedLabel,
          sessions: trendsMap[dateStr].sessions,
          listeners: trendsMap[dateStr].listeners.size,
        };
      });

    // Programme analytics
    const programmeEvents = await prisma.listenerEvent.findMany({
      where: {
        programmeId: { not: null },
        ...(startDate ? { timestamp: { gte: startDate } } : {}),
      },
      include: {
        programme: {
          select: { id: true, title: true },
        },
      },
    });

    const progMap: Record<
      string,
      { title: string; listeners: Set<string>; sessions: number }
    > = {};

    for (const pe of programmeEvents) {
      if (!pe.programme) continue;
      const pid = pe.programme.id;
      if (!progMap[pid]) {
        progMap[pid] = {
          title: pe.programme.title,
          listeners: new Set(),
          sessions: 0,
        };
      }
      progMap[pid].listeners.add(pe.anonymousListenerId);
      progMap[pid].sessions += 1;
    }

    const programmeAnalytics = Object.entries(progMap).map(([pid, val]) => ({
      programmeId: pid,
      title: val.title,
      listeners: val.listeners.size,
      sessions: val.sessions,
      avgDurationMinutes: Math.round(avgSessionDurationSeconds / 60) || 15,
    }));

    return NextResponse.json({
      success: true,
      hasData: totalSessions > 0,
      activeListeners,
      totalListeners,
      totalSessions,
      avgSessionDurationSeconds,
      universitiesReached,
      universityAudience,
      listeningTrends,
      programmeAnalytics,
    });
  } catch (error) {
    console.error("Failed to generate analytics summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate analytics summary" },
      { status: 500 }
    );
  }
}
