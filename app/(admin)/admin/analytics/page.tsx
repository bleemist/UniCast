import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsDashboardClient } from "@/components/admin/AnalyticsDashboardClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Initial 7-day query
  const [activeSessions, sessions, programmeEvents] = await Promise.all([
    prisma.listenerSession.findMany({
      where: { lastSeenAt: { gte: twoMinutesAgo } },
      select: { anonymousListenerId: true },
    }),
    prisma.listenerSession.findMany({
      where: { sessionStartedAt: { gte: sevenDaysAgo } },
      include: {
        university: {
          select: { id: true, name: true, shortName: true },
        },
      },
      orderBy: { sessionStartedAt: "asc" },
    }),
    prisma.listenerEvent.findMany({
      where: {
        programmeId: { not: null },
        timestamp: { gte: sevenDaysAgo },
      },
      include: {
        programme: { select: { id: true, title: true } },
      },
    }),
  ]);

  const activeListeners = new Set(activeSessions.map((s) => s.anonymousListenerId)).size;
  const totalSessions = sessions.length;
  const uniqueListenerIds = new Set(sessions.map((s) => s.anonymousListenerId));
  const totalListeners = uniqueListenerIds.size;
  const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0);
  const avgSessionDurationSeconds =
    totalSessions > 0 ? Math.round(totalDurationSeconds / totalSessions) : 0;

  // University audience mapping
  const uniMap: Record<
    string,
    {
      universityId: string;
      universityName: string;
      shortName: string | null;
      listenerIds: Set<string>;
      sessionCount: number;
      totalDuration: number;
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
      };
    }
    uniMap[uId].listenerIds.add(s.anonymousListenerId);
    uniMap[uId].sessionCount += 1;
    uniMap[uId].totalDuration += s.sessionDuration || 0;
  }

  const universityAudience = Object.values(uniMap)
    .map((item) => {
      const listeners = item.listenerIds.size;
      const avgDurationMinutes =
        item.sessionCount > 0 ? Math.round(item.totalDuration / item.sessionCount / 60) : 0;
      const percentage =
        totalSessions > 0 ? Number(((item.sessionCount / totalSessions) * 100).toFixed(1)) : 0;

      return {
        universityId: item.universityId,
        universityName: item.universityName,
        shortName: item.shortName,
        listeners,
        sessions: item.sessionCount,
        avgDurationMinutes,
        percentage,
      };
    })
    .sort((a, b) => b.listeners - a.listeners);

  const universitiesReached = Object.keys(uniMap).filter((k) => k !== "unknown").length;

  // Daily trend
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
      return {
        label: `${parts[1]}/${parts[2]}`,
        sessions: trendsMap[dateStr].sessions,
        listeners: trendsMap[dateStr].listeners.size,
      };
    });

  // Programmes breakdown
  const progMap: Record<string, { title: string; listeners: Set<string>; sessions: number }> = {};
  for (const pe of programmeEvents) {
    if (!pe.programme) continue;
    const pid = pe.programme.id;
    if (!progMap[pid]) {
      progMap[pid] = { title: pe.programme.title, listeners: new Set(), sessions: 0 };
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

  const initialData = {
    hasData: totalSessions > 0,
    activeListeners,
    totalListeners,
    totalSessions,
    avgSessionDurationSeconds,
    universitiesReached,
    universityAudience,
    listeningTrends,
    programmeAnalytics,
  };

  return <AnalyticsDashboardClient initialData={initialData} />;
}
