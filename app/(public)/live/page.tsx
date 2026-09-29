import prisma from "@/lib/prisma";
import { LiveStudioClientView } from "./LiveStudioClientView";

export const dynamic = "force-dynamic";

export default async function LiveRadioPage() {
  // Fetch current show and upcoming shows
  const programmes = await prisma.programme.findMany({
    include: { presenter: true, category: true },
    take: 3,
  });

  const latestPodcasts = await prisma.podcast.findMany({
    where: { isPublished: true },
    include: { presenter: true },
    take: 2,
    orderBy: { publishedAt: "desc" },
  });

  const currentShow = programmes[0] || null;
  const upcomingShow = programmes[1] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12">
      <LiveStudioClientView
        currentShow={currentShow}
        upcomingShow={upcomingShow}
        latestPodcasts={latestPodcasts}
      />
    </div>
  );
}
