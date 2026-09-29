import prisma from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layers, Mic, Calendar, ArrowRight, Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Radio Programmes | UniCast",
  description:
    "Explore the full roster of shows broadcasting on UniCast. From morning news to varsity sports and late night vibes.",
};

export default async function ProgrammesPage() {
  const [programmes, categories] = await Promise.all([
    prisma.programme.findMany({
      include: {
        category: true,
        presenter: true,
        schedules: {
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.programmeCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12">
      {/* Page Title */}
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Broadcasting Lineup
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Radio Programmes
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Every programme on UniCast broadcasts nationwide across universities. Explore our lineup of student lifestyle, news analysis, varsity sports, and tech discussions.
        </p>
      </div>

      {/* Programmes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programmes.map((prog) => (
          <Link
            key={prog.id}
            href={`/programmes/${prog.slug}`}
            className="group block focus-visible:outline-none"
          >
            <Card className="h-full border-navy-800 bg-navy-850/80 hover:border-radio-500/50 hover:bg-navy-850 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg">
              <div>
                {/* Cover Art */}
                <div className="relative h-48 w-full bg-navy-950 overflow-hidden">
                  <Image
                    src={prog.coverImage}
                    alt={prog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="category" size="sm">
                      {prog.category.name}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-radio-300 transition-colors line-clamp-1">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {prog.tagline}
                  </p>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-navy-750 text-xs text-slate-300">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-radio-400/60 flex-shrink-0">
                      <Image
                        src={prog.presenter.avatar}
                        alt={prog.presenter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium truncate text-white">
                      {prog.presenter.name}
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Bottom footer slot */}
              <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-radio-400" />
                  {prog.schedules.length} Weekly Slot{prog.schedules.length !== 1 ? "s" : ""}
                </span>
                <span className="text-radio-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  View show details →
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
