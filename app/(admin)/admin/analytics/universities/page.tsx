import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Search, BarChart3, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminUniversityAnalyticsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch all universities with session aggregates
  const universities = await prisma.university.findMany({
    include: {
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

  const allSessionsCount = await prisma.listenerSession.count();

  const formatted = universities
    .map((u) => {
      const uniqueListeners = new Set(u.listenerSessions.map((s) => s.anonymousListenerId)).size;
      const sessionCount = u.listenerSessions.length;
      const totalSeconds = u.listenerSessions.reduce((acc, s) => acc + (s.sessionDuration || 0), 0);
      const avgMinutes = sessionCount > 0 ? Math.round(totalSeconds / sessionCount / 60) : 0;
      const totalHours = (totalSeconds / 3600).toFixed(1);
      const sharePercentage =
        allSessionsCount > 0 ? Number(((sessionCount / allSessionsCount) * 100).toFixed(1)) : 0;

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
        uniqueListeners,
        sessionCount,
        totalHours,
        avgMinutes,
        sharePercentage,
        lastActivity,
      };
    })
    .sort((a, b) => b.uniqueListeners - a.uniqueListeners);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics Overview</span>
        </Link>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Institutional Telemetry
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          University Audience Breakdown
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ranked comparison of student listening volume, session frequency, and listening time per campus.
        </p>
      </div>

      <Card className="border-navy-800 bg-navy-850/80 overflow-hidden shadow-xl">
        <CardHeader className="pb-4 border-b border-navy-750">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-white">
                Universities Leaderboard ({formatted.length} Campuses)
              </CardTitle>
              <CardDescription className="text-xs">
                Derived directly from verifiable listener session records.
              </CardDescription>
            </div>
            <Link
              href="/admin/universities"
              className="text-xs text-radio-400 hover:underline font-semibold"
            >
              Manage University Roster →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {formatted.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No universities registered yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-navy-750 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Rank & University</th>
                  <th className="py-3.5 px-4 font-bold text-center">Location</th>
                  <th className="py-3.5 px-4 font-bold text-right">Unique Listeners</th>
                  <th className="py-3.5 px-4 font-bold text-right">Sessions</th>
                  <th className="py-3.5 px-4 font-bold text-right">Total Time</th>
                  <th className="py-3.5 px-4 font-bold text-right">Avg Duration</th>
                  <th className="py-3.5 px-4 font-bold text-right">Audience Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750">
                {formatted.map((uni, idx) => (
                  <tr key={uni.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-slate-500 font-bold text-xs text-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {uni.name}
                            </span>
                            {uni.shortName && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-radio-300 font-bold">
                                {uni.shortName}
                              </span>
                            )}
                          </div>
                          {uni.lastActivity && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Last active: {uni.lastActivity.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {uni.location || "Uganda"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {uni.uniqueListeners.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {uni.sessionCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                      {uni.totalHours} hrs
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      ~{uni.avgMinutes} min
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-radio-400">{uni.sharePercentage}%</span>
                        <div className="w-16 bg-navy-900 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-radio-500 h-full rounded-full"
                            style={{ width: `${Math.min(uni.sharePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
