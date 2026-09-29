import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UniversityManagementClient } from "@/components/admin/UniversityManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

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
          anonymousListenerId: true,
          sessionDuration: true,
          lastSeenAt: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const formatted = universities.map((u) => {
    const uniqueListeners = new Set(u.listenerSessions.map((s) => s.anonymousListenerId)).size;
    const totalDuration = u.listenerSessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0);
    const avgDuration =
      u.listenerSessions.length > 0
        ? Math.round(totalDuration / u.listenerSessions.length / 60)
        : 0;

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

  return <UniversityManagementClient initialUniversities={formatted} />;
}
