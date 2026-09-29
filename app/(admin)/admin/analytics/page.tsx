import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Radio, MessageSquare, Headphones, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [totalRequests, approvedRequests, playedRequests, totalPodcasts] =
    await Promise.all([
      prisma.songRequest.count(),
      prisma.songRequest.count({ where: { status: "APPROVED" } }),
      prisma.songRequest.count({ where: { status: "PLAYED" } }),
      prisma.podcast.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Station Metrics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Broadcasting & Listener Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real metrics derived strictly from verifiable database and interaction records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-navy-800 bg-navy-850/80 p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">All-Time Song Requests</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalRequests}</h3>
          <span className="text-[11px] text-radio-400">Student submissions</span>
        </Card>

        <Card className="border-navy-800 bg-navy-850/80 p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Approved Songs</p>
          <h3 className="text-2xl font-bold text-white mt-1">{approvedRequests}</h3>
          <span className="text-[11px] text-emerald-400">Accepted by DJ</span>
        </Card>

        <Card className="border-navy-800 bg-navy-850/80 p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Broadcasted Tracks</p>
          <h3 className="text-2xl font-bold text-white mt-1">{playedRequests}</h3>
          <span className="text-[11px] text-purple-400">Aired live</span>
        </Card>

        <Card className="border-navy-800 bg-navy-850/80 p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Published Podcasts</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalPodcasts}</h3>
          <span className="text-[11px] text-slate-400">On-demand archives</span>
        </Card>
      </div>

      <Card className="border-navy-800 bg-navy-850/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-semibold text-white">
              Real-time Concurrent Listener Telemetry
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Measurement standard: Transparent university broadcasting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            In accordance with the station data integrity guidelines, concurrent listener counts are directly reported by the Icecast / streaming relay mount server rather than artificially simulated by client-side counters.
          </p>
          <p className="text-slate-400">
            To view detailed raw listener logs, check your Icecast admin panel at <code>/admin/stats</code> on your streaming server host.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
