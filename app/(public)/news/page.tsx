import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Newspaper, Calendar, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campus News & Bulletins | UniCast",
  description:
    "Read the latest university news, varsity sports coverage, and student innovation stories on UniCast.",
};

export default async function NewsPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      author: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Journalism & Stories
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Radio News & Campus Bulletin
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Top stories across university campuses, student leadership activities, varsity sports, and national youth developments.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-850 border border-navy-800 space-y-3">
          <Newspaper className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            Editorial Desk Updating
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Our student newsroom is preparing today's bulletins. Check back shortly!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/news/${art.slug}`}
              className="group block focus-visible:outline-none"
            >
              <Card className="h-full border-navy-800 bg-navy-850/80 hover:border-radio-400/50 hover:bg-navy-850 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg">
                <div>
                  <div className="relative h-48 w-full bg-navy-900 overflow-hidden">
                    <Image
                      src={art.coverImage}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="category" size="sm">
                        {art.category.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-radio-300 transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-navy-750/60 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-radio-400" />
                    {art.author.name}
                  </span>
                  <span className="text-radio-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read article →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
