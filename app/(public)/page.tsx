import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Radio,
  Play,
  Calendar,
  Music,
  Headphones,
  Mic,
  ArrowRight,
  Clock,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { HomeLivePlayerHero } from "@/components/home/HomeLivePlayerHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real programmes, schedules, and presenters from database
  const [programmes, schedules, presenters, podcasts, latestRequests] =
    await Promise.all([
      prisma.programme.findMany({
        include: { category: true, presenter: true },
        take: 4,
      }),
      prisma.schedule.findMany({
        where: { dayOfWeek: "MONDAY" }, // default weekday lineup
        include: {
          programme: {
            include: { presenter: true, category: true },
          },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.presenter.findMany({
        where: { isActive: true },
        take: 4,
      }),
      prisma.podcast.findMany({
        where: { isPublished: true },
        include: { presenter: true, category: true },
        take: 2,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.songRequest.findMany({
        where: { status: { in: ["APPROVED", "PLAYED"] } },
        take: 3,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const currentShow = programmes[0] || null;

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Live Now Hero Section */}
      <HomeLivePlayerHero currentShow={currentShow} />

      {/* 2. Today's Programme Lineup (What's On) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-radio-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
                Programming Timetable
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Today on UniCast
            </h2>
          </div>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-radio-400 hover:text-radio-300 transition-colors"
          >
            <span>View Complete Weekly Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {schedules.map((item, idx) => {
            const isFirst = idx === 1; // Mark mid-morning as sample active
            return (
              <Card
                key={item.id}
                className={
                  isFirst
                    ? "border-radio-500/50 bg-gradient-to-b from-navy-800 to-navy-850 shadow-lg shadow-radio-500/10 relative overflow-hidden"
                    : "border-navy-800 bg-navy-850/60 hover:border-navy-700"
                }
              >
                {isFirst && (
                  <div className="absolute top-0 right-0">
                    <span className="inline-block px-3 py-1 bg-live text-white font-bold text-[9px] uppercase tracking-wider rounded-bl-lg">
                      ON AIR NOW
                    </span>
                  </div>
                )}
                <div className="relative h-36 w-full bg-navy-900 overflow-hidden">
                  <Image
                    src={item.programme.coverImage}
                    alt={item.programme.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-950/80 text-radio-400 border border-radio-500/30">
                      {item.startTime} - {item.endTime}
                    </span>
                    <Badge variant="category" size="sm">
                      {item.programme.category.name}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-white line-clamp-1">
                    {item.programme.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.programme.tagline}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-navy-750">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-navy-700">
                      <Image
                        src={item.programme.presenter.avatar}
                        alt={item.programme.presenter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate">
                      {item.programme.presenter.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Student Hub (Requests & Podcasts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Song Requests Promo Banner */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-radio-950/60 via-navy-850 to-navy-900 border border-radio-500/30 p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4 max-w-xl z-10">
              <Badge variant="gold" size="md">
                Interactive Student Radio
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Got a favorite track or a shoutout for your campus?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Send your song request directly to the on-air DJ in the UniCast
                studio. Dedicate it to your faculty, course-mates, or hostel friends on any university campus!
              </p>
              <div className="pt-2">
                <Link href="/request">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Music className="w-4 h-4" />}
                  >
                    Submit a Song Request
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Played Requests Ticker */}
            {latestRequests.length > 0 && (
              <div className="mt-8 pt-6 border-t border-navy-750 z-10">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                  Recently Queued / Played in Studio:
                </span>
                <div className="flex flex-wrap gap-2">
                  {latestRequests.map((req) => (
                    <span
                      key={req.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-navy-900 border border-navy-700 text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <strong>{req.songTitle}</strong> by {req.artist} ({req.studentName})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Featured Podcasts Card */}
          <div className="rounded-2xl bg-navy-850 border border-navy-800 p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-radio-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Latest Podcasts
                  </span>
                </div>
                <Link
                  href="/podcasts"
                  className="text-xs text-radio-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {podcasts.map((pod) => (
                <div
                  key={pod.id}
                  className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-2"
                >
                  <span className="text-[10px] font-semibold text-radio-400 uppercase tracking-wide">
                    {pod.category.name}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2">
                    {pod.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {pod.description}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Host: {pod.presenter.name}</span>
                    <Link
                      href={`/podcasts/${pod.slug}`}
                      className="text-radio-400 hover:text-white font-medium"
                    >
                      Listen Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-navy-800">
              <Link href="/podcasts">
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  Browse All Recorded Shows
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Meet Our Presenters Roster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-radio-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
                The Voices Behind The Mic
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Meet Our On-Air Presenters
            </h2>
          </div>
          <Link
            href="/presenters"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-radio-400 hover:text-radio-300 transition-colors"
          >
            <span>All Presenter Profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {presenters.map((pres) => (
            <Link
              key={pres.id}
              href={`/presenters/${pres.slug}`}
              className="rounded-2xl bg-navy-850 border border-navy-800 p-5 text-center space-y-3 hover:border-navy-700 transition-colors group block"
            >
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-radio-500/40 group-hover:border-radio-400 transition-colors">
                <Image
                  src={pres.avatar}
                  alt={pres.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-radio-300 transition-colors">
                  {pres.name}
                </h3>
                <p className="text-xs text-radio-400 font-medium mt-0.5">
                  {pres.roleTitle}
                </p>
              </div>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {pres.bio}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
