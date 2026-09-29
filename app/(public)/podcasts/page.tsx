import prisma from "@/lib/prisma";
import { PodcastsClientView } from "./PodcastsClientView";

export const dynamic = "force-dynamic";

export default async function PodcastsPage() {
  const [podcasts, categories] = await Promise.all([
    prisma.podcast.findMany({
      where: { isPublished: true },
      include: {
        presenter: true,
        category: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.podcastCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      <PodcastsClientView podcasts={podcasts} categories={categories} />
    </div>
  );
}
