import prisma from "@/lib/prisma";
import { Music, Radio, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { SongRequestForm } from "./SongRequestForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Song Requests & Shoutouts | UniCast",
  description:
    "Request your favourite song or send a campus dedication live on UniCast — Your Campus Pulse.",
};

export default async function RequestsPage() {
  const recentRequests = await prisma.songRequest.findMany({
    where: { status: { in: ["APPROVED", "PLAYED"] } },
    take: 8,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Student Interaction
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Song Requests & Live Dedications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Direct line to the UniCast studio booth! Submit your favourite track and cross-campus dedication to be aired live nationwide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Request Form */}
        <div className="lg:col-span-7">
          <Card className="border-navy-700/80 bg-navy-850/80 shadow-2xl">
            <CardHeader className="pb-4 border-b border-navy-750">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
                  Send Your Request to the Studio
                </CardTitle>
                <Badge variant="live" size="sm">
                  ON-AIR QUEUE
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Fill in your track title and dedication. Your request will appear directly on the presenter’s console.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SongRequestForm />
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Recently Played / Live Ticker */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-navy-800 bg-navy-850/70">
            <CardHeader className="pb-3 border-b border-navy-750">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-radio-400" />
                <CardTitle className="text-sm font-semibold text-white">
                  Live Queue & Played Tracks
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Recent songs approved and spun by UniCast on-air presenters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {recentRequests.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No requests queued yet. Be the first to submit!
                </p>
              ) : (
                recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">
                        {req.songTitle} - {req.artist}
                      </h4>
                      <Badge
                        variant={req.status === "PLAYED" ? "played" : "approved"}
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Requested by: <span className="text-slate-200">{req.studentName}</span>
                      {req.course && ` • ${req.course}`}
                    </p>
                    {req.dedication && (
                      <p className="text-[11px] text-radio-300 italic pt-1 border-t border-navy-800/80">
                        "{req.dedication}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Campus Privacy Shield</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              We never collect or display your telephone numbers, student logins, or private emails publicly.
              All song requests are reviewed in studio for appropriate language.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
