import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Mic, Radio, Layers, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "On-Air Presenters | UniCast",
  description:
    "Meet the on-air presenters, DJs, and journalists broadcasting live on UniCast — Your Campus Pulse.",
};

export default async function PresentersPage() {
  let presenters: any[] = [];
  try {
    presenters = await prisma.presenter.findMany({
      where: { isActive: true, isArchived: false },
      include: {
        programmes: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Could not load presenters data:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Station Personalities
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Meet Our On-Air Presenters
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          The talented campus broadcasters, journalists, and DJs who bring you the best in university media.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presenters.map((pres) => (
          <Link
            key={pres.id}
            href={`/presenters/${pres.slug}`}
            className="group block focus-visible:outline-none"
          >
            <Card className="h-full border-navy-800 bg-navy-850/80 hover:border-radio-400/50 hover:bg-navy-850 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg">
              <div>
                <div className="relative h-64 w-full bg-navy-900 overflow-hidden">
                  <Image
                    src={pres.avatar}
                    alt={pres.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-radio-300 transition-colors">
                      {pres.name}
                    </h3>
                    <p className="text-xs font-semibold text-radio-400 mt-0.5">
                      {pres.roleTitle}
                    </p>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {pres.bio}
                  </p>

                  {pres.programmes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-navy-750">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-radio-400" />
                        Assigned Programmes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pres.programmes.map((prog: any) => (
                          <span
                            key={prog.id}
                            className="px-2.5 py-1 rounded-md text-xs bg-navy-900 border border-navy-700 text-slate-200"
                          >
                            {prog.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="px-5 pb-5 pt-0 text-xs text-radio-400 font-semibold flex items-center justify-end gap-1">
                <span>View Full Host Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
