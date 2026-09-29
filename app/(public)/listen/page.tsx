import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { ListenPlayerClient } from "./ListenPlayerClient";
import { resolveCurrentAndUpcoming } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listen Live Studio | Kyambogo Radio 107.4 FM",
  description:
    "Tune in live to Kyambogo University Online Radio. Stream official campus shows, guild debates, varsity athletics, and hot African hits.",
};

export default async function ListenPage() {
  const [schedules, latestPodcasts, recentRequests] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        programme: {
          include: { presenter: true, category: true },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.podcast.findMany({
      where: { isPublished: true },
      include: { presenter: true, category: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.songRequest.findMany({
      where: { status: { in: ["APPROVED", "PLAYED"] } },
      take: 4,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const { current, upcoming } = resolveCurrentAndUpcoming(schedules);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
      <ListenPlayerClient
        currentSchedule={current}
        upcomingSchedules={upcoming}
        todaySchedules={schedules.filter((s) => s.dayOfWeek === "MONDAY")}
        latestPodcasts={latestPodcasts}
        recentRequests={recentRequests}
      />
    </div>
  );
}
