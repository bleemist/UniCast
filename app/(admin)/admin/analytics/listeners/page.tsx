import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, Shield, Laptop, Smartphone, Tablet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminListenerSessionsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch recent sessions
  const sessions = await prisma.listenerSession.findMany({
    take: 50,
    include: {
      university: {
        select: { name: true, shortName: true },
      },
    },
    orderBy: { sessionStartedAt: "desc" },
  });

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
          <Activity className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Telemetry Stream
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Listener Sessions Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Privacy-conscious anonymous listener connections. Zero student names or private identifiers are stored or exposed.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center gap-3 text-xs text-slate-400">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Privacy Shield Active:</strong> Session tokens are anonymous random client hashes. Administrators review aggregate connection health without tracking individual human identities.
        </p>
      </div>

      <Card className="border-navy-800 bg-navy-850/80 overflow-hidden shadow-xl">
        <CardHeader className="pb-4 border-b border-navy-750">
          <CardTitle className="text-base text-white">
            Recent 50 Listening Sessions
          </CardTitle>
          <CardDescription className="text-xs">
            Live stream and podcast connections recorded by UniCast.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No listener sessions recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-navy-750 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Anonymous ID</th>
                  <th className="py-3 px-4 font-bold">Campus / University</th>
                  <th className="py-3 px-4 font-bold text-center">Device & Browser</th>
                  <th className="py-3 px-4 font-bold text-right">Duration</th>
                  <th className="py-3 px-4 font-bold text-right">Started At</th>
                  <th className="py-3 px-4 font-bold text-right">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750">
                {sessions.map((s) => {
                  const minutes = Math.round((s.sessionDuration || 0) / 60);
                  const isRecent = new Date().getTime() - s.lastSeenAt.getTime() < 120000;

                  return (
                    <tr key={s.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {isRecent && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                          )}
                          <span>{s.anonymousListenerId.slice(0, 16)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {s.university ? (
                          <div className="flex items-center gap-1.5">
                            <span>{s.university.name}</span>
                            {s.university.shortName && (
                              <span className="text-[10px] font-mono px-1 rounded bg-navy-900 text-radio-300">
                                {s.university.shortName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unspecified Campus</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-navy-900 border border-navy-750 text-[11px] text-slate-300">
                          {s.deviceType === "mobile" ? (
                            <Smartphone className="w-3 h-3 text-radio-400" />
                          ) : s.deviceType === "tablet" ? (
                            <Tablet className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{s.deviceType || "desktop"}</span>
                          <span>•</span>
                          <span>{s.browser || "web"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-radio-300">
                        {minutes > 0 ? `${minutes} min` : `${s.sessionDuration}s`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(s.sessionStartedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(s.lastSeenAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
