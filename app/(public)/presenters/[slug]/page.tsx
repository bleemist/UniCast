import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mic, ArrowLeft, Layers, Headphones, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

interface PresenterDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PresenterDetailPageProps): Promise<Metadata> {
  const presenter = await prisma.presenter.findUnique({
    where: { slug: params.slug },
  });

  if (!presenter) {
    return { title: "Presenter Not Found | UniCast" };
  }

  return {
    title: `${presenter.name} | UniCast Presenters`,
    description: presenter.bio.slice(0, 160),
  };
}

export default async function PresenterDetailPage({
  params,
}: PresenterDetailPageProps) {
  const presenter = await prisma.presenter.findUnique({
    where: { slug: params.slug },
    include: {
      programmes: {
        include: { category: true },
      },
      podcasts: {
        where: { isPublished: true },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!presenter) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      <div>
        <Link
          href="/presenters"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Presenters</span>
        </Link>
      </div>

      {/* Host Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 md:p-8 rounded-3xl bg-navy-850/80 border border-navy-750 shadow-xl">
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-radio-500/40 shadow-2xl">
            <Image
              src={presenter.avatar}
              alt={presenter.name}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-8 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <Badge variant="category" size="sm">
              UniCast On-Air Team
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {presenter.name}
            </h1>
            <p className="text-base text-radio-300 font-medium">
              {presenter.roleTitle}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {presenter.bio}
          </p>
        </div>
      </div>

      {/* Programmes Hosted */}
      <div className="space-y-4 pt-6 border-t border-navy-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-radio-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Programmes Hosted by {presenter.name}
          </h2>
        </div>

        {presenter.programmes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">
            No active shows currently assigned to this presenter.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {presenter.programmes.map((prog) => (
              <Link key={prog.id} href={`/programmes/${prog.slug}`}>
                <Card className="h-full border-navy-800 bg-navy-850/60 hover:border-radio-400/50 hover:bg-navy-850 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="relative h-40 w-full bg-navy-900">
                    <Image
                      src={prog.coverImage}
                      alt={prog.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="category" size="sm">
                        {prog.category.name}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-1.5">
                    <h3 className="font-bold text-sm text-white line-clamp-1">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {prog.tagline}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Podcasts Hosted */}
      {presenter.podcasts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-navy-800">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-radio-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recorded Podcasts & Episodes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presenter.podcasts.map((pod) => (
              <Link key={pod.id} href={`/podcasts/${pod.slug}`}>
                <div className="p-4 rounded-2xl bg-navy-850 border border-navy-800 hover:border-navy-700 flex items-center justify-between gap-4 transition-all">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-radio-400">
                      {pod.category.name}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {pod.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {pod.description}
                    </p>
                  </div>
                  <span className="text-xs text-radio-400 font-semibold flex-shrink-0">
                    Listen →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
