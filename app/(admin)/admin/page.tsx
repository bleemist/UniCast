import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Radio,
  MessageSquare,
  Layers,
  Mic,
  Headphones,
  ArrowUpRight,
  Laptop,
  CheckCircle2,
  Clock,
  GraduationCap,
  Users,
  Activity,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch real counts from database
  const [
    activeSessions,
    totalSessions24h,
    universitiesCount,
    pendingRequestsCount,
    totalProgrammesCount,
    totalPresentersCount,
    recentRequests,
  ] = await Promise.all([
    prisma.listenerSession.findMany({
      where: { lastSeenAt: { gte: twoMinutesAgo } },
      select: { anonymousListenerId: true },
    }),
    prisma.listenerSession.count({
      where: { sessionStartedAt: { gte: oneDayAgo } },
    }),
    prisma.university.count({ where: { isActive: true } }),
    prisma.songRequest.count({ where: { status: "PENDING" } }),
    prisma.programme.count(),
    prisma.presenter.count(),
    prisma.songRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeListenersCount = new Set(activeSessions.map((s) => s.anonymousListenerId)).size;
  const streamUrl =
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ||
    process.env.NEXT_PUBLIC_STREAM_URL ||
    "https://stream.zeno.fm/f3wvbbqmdg8uv";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-850 via-navy-800 to-navy-850 border border-navy-700/80 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Welcome back, {session.name}
            </h2>
            <Badge variant="category" size="sm">
              {session.role}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            UniCast • Master Broadcast, Audience Analytics & Programming Console
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/broadcast">
            <Button variant="live" size="sm" leftIcon={<Radio className="w-4 h-4" />}>
              Broadcast Desk
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="primary" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Listener Analytics
            </Button>
          </Link>
          <Link href="/admin/requests">
            <Button variant="secondary" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
              Requests ({pendingRequestsCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Listeners Telemetry */}
        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Listeners
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {activeListenersCount}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live concurrent listeners
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions (24h) */}
        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sessions (24h)
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalSessions24h}
              </h3>
              <p className="text-[11px] text-radio-400 mt-1">Across all campuses</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Connected Universities */}
        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Campuses In Network
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {universitiesCount}
              </h3>
              <p className="text-[11px] text-cyan-300 mt-1">Active universities</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Requests
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {pendingRequestsCount}
              </h3>
              <p className="text-[11px] text-amber-400 mt-1">Needs review</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasting Pipeline Status & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Studio Transmission Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-navy-800 bg-navy-850/80">
            <CardHeader className="pb-3 border-b border-navy-750 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-radio-400" />
                <CardTitle className="text-base text-white">
                  Studio Transmission & On-Air Status
                </CardTitle>
              </div>
              <Badge variant="online" size="sm">
                STREAM READY
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-slate-400 block font-medium">Broadcast Mount Point</span>
                  <p className="text-xs font-mono text-radio-300 truncate">
                    {streamUrl}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-slate-400 block font-medium">Format & Quality</span>
                  <span className="text-white font-semibold">Live Stereo • 128 kbps</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Start presenting, enable studio mic, and upload requested songs.
                </p>
                <Link href="/admin/broadcast">
                  <Button variant="live" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Enter Broadcast Desk
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Recent Song Requests */}
        <div className="space-y-6">
          <Card className="border-navy-800 bg-navy-850/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white">
                  Live Song Requests
                </CardTitle>
                <Link
                  href="/admin/requests"
                  className="text-xs text-radio-400 hover:underline flex items-center gap-1"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No requests yet
                </p>
              ) : (
                recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg bg-navy-900 border border-navy-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">
                        {req.songTitle} - {req.artist}
                      </span>
                      <Badge
                        variant={
                          req.status === "PENDING"
                            ? "pending"
                            : req.status === "APPROVED"
                            ? "approved"
                            : "played"
                        }
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      From: {req.studentName} {req.course ? `(${req.course})` : ""}
                    </p>
                    {req.dedication && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-1">
                        "{req.dedication}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
