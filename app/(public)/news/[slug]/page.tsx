import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Newspaper, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface NewsArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article) {
    return { title: "Article Not Found | UniCast News" };
  }

  return {
    title: `${article.title} | UniCast News`,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: {
        select: { name: true, avatar: true },
      },
    },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Campus News & Stories</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <Badge variant="category" size="md">
          {article.category.name}
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {article.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4 pt-3 border-t border-navy-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-radio-500/20 text-radio-400 flex items-center justify-center font-bold text-[10px]">
              {article.author.name.charAt(0)}
            </div>
            <span className="text-white font-medium">{article.author.name}</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-navy-750 shadow-2xl bg-navy-950">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 800px"
        />
      </div>

      {/* Article Body */}
      <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line pt-4">
        {article.content}
      </div>
    </article>
  );
}
