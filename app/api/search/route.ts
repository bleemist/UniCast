import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      results: { programmes: [], presenters: [], podcasts: [], articles: [] },
      totalCount: 0,
    });
  }

  try {
    const [programmes, presenters, podcasts, articles] = await Promise.all([
      prisma.programme.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { tagline: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { category: true, presenter: true },
        take: 4,
      }),
      prisma.presenter.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { roleTitle: { contains: query } },
            { bio: { contains: query } },
          ],
        },
        take: 4,
      }),
      prisma.podcast.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { category: true, presenter: true },
        take: 4,
      }),
      prisma.article.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
          ],
        },
        include: { category: true, author: true },
        take: 4,
      }),
    ]);

    const totalCount =
      programmes.length + presenters.length + podcasts.length + articles.length;

    return NextResponse.json({
      query,
      results: { programmes, presenters, podcasts, articles },
      totalCount,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
