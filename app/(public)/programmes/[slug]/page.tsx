import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Mic, Radio, Music, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

interface ProgrammeDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProgrammeDetailPageProps): Promise<Metadata> {
  const programme = await prisma.programme.findUnique({
    where: { slug: params.slug },
  });

  if (!programme) {
    return { title: "Programme Not Found | UniCast" };
  }

  return {
    title: `${programme.title} | UniCast Programmes`,
    description: programme.tagline,
  };
}

export default async function ProgrammeDetailPage({
  params,
}: ProgrammeDetailPageProps) {
  const programme = await prisma.programme.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      presenter: true,
      schedules: {
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!programme) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/programmes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Programmes</span>
        </Link>
      </div>

      {/* Show Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cover Art */}
        <div className="lg:col-span-5">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-navy-700/80 shadow-2xl bg-navy-850">
            <Image
              src={programme.coverImage}
              alt={programme.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge variant="category" size="md">
                {programme.category.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Show Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {programme.title}
            </h1>
            <p className="text-base sm:text-lg text-radio-300 font-medium leading-snug">
              {programme.tagline}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {programme.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/listen">
              <Button variant="live" size="md" leftIcon={<Radio className="w-4 h-4" />}>
                Listen Live Studio
              </Button>
            </Link>
            <Link href="/request">
              <Button variant="secondary" size="md" leftIcon={<Music className="w-4 h-4" />}>
                Request Song on this Show
              </Button>
            </Link>
          </div>

          {/* Host Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-navy-850 border border-navy-750 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-radio-400 flex-shrink-0">
                <Image
                  src={programme.presenter.avatar}
                  alt={programme.presenter.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-radio-400">
                  On-Air Presenter
                </span>
                <h4 className="text-base font-bold text-white truncate">
                  {programme.presenter.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {programme.presenter.roleTitle}
                </p>
              </div>
            </div>

            <Link
              href={`/presenters/${programme.presenter.slug}`}
              className="text-xs text-radio-400 hover:underline flex-shrink-0 font-medium"
            >
              View Host Bio →
            </Link>
          </div>
        </div>
      </div>

      {/* Broadcast Schedule Timetable for this Show */}
      <div className="space-y-4 pt-6 border-t border-navy-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-radio-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Broadcast Slots
          </h2>
        </div>

        {programme.schedules.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">
            No recurring slots currently assigned for this show.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {programme.schedules.map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">
                    {slot.dayOfWeek}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Weekly Transmission
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-navy-900 border border-navy-750 text-radio-300 font-mono font-semibold">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
