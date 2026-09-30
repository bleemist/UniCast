import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PodcastManagementClient } from "@/components/admin/PodcastManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminPodcastsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [podcasts, categories, presenters] = await Promise.all([
    prisma.podcast.findMany({
      where: { isArchived: false },
      include: { presenter: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.podcastCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.presenter.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PodcastManagementClient
      initialPodcasts={podcasts as any}
      categories={categories}
      presenters={presenters}
    />
  );
}
