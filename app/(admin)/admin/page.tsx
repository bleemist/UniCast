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

  // Fetch real counts from database
  const [
    pendingRequestsCount,
    totalProgrammesCount,
    totalPresentersCount,
    totalPodcastsCount,
    recentRequests,
  ] = await Promise.all([
    prisma.songRequest.count({ where: { status: "PENDING" } }),
    prisma.programme.count(),
    prisma.presenter.count(),
    prisma.podcast.count(),
    prisma.songRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const streamUrl =
    process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv";

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
            Kyambogo Radio 107.4 FM • Master Broadcast & Programming Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/broadcast">
            <Button variant="live" size="sm" leftIcon={<Radio className="w-4 h-4" />}>
              Broadcast Desk
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

        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Radio Programmes
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalProgrammesCount}
              </h3>
              <p className="text-[11px] text-radio-400 mt-1">Active shows</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                On-Air Presenters
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalPresentersCount}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1">Host roster</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mic className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Podcasts / Episodes
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalPodcastsCount}
              </h3>
              <p className="text-[11px] text-purple-400 mt-1">On-demand</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Headphones className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Studio Audio Pipeline & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Broadcasting Pipeline Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-navy-800 bg-navy-850/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-radio-400" />
                  <CardTitle className="text-base text-white">
                    Laptop Audio Ingestion Pipeline
                  </CardTitle>
                </div>
                <Badge variant="online" size="sm">
                  STREAM SERVER READY
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Audio is sent from your broadcasting laptop using BUTT or OBS Studio directly to the streaming server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-slate-400 block font-medium">Broadcast Software</span>
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    BUTT / OBS Studio / Mixxx (Free)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-slate-400 block font-medium">Encoding Format</span>
                  <span className="text-white font-semibold">MP3 128 kbps / AAC 64 kbps</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-navy-900 border border-navy-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                    Public Stream Endpoint
                  </span>
                  <p className="text-xs font-mono text-radio-300 truncate mt-0.5">
                    {streamUrl}
                  </p>
                </div>
                <Link href="/admin/broadcast">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Configure Ingestion
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
