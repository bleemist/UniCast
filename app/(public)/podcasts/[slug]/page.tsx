import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PodcastDetailClient } from "./PodcastDetailClient";

export const dynamic = "force-dynamic";

interface PodcastPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const podcast = await prisma.podcast.findUnique({
    where: { slug: params.slug },
  });

  if (!podcast) {
    return { title: "Podcast Not Found | UniCast" };
  }

  return {
    title: `${podcast.title} | UniCast Podcasts`,
    description: podcast.description.slice(0, 160),
  };
}

export default async function PodcastDetailPage({ params }: PodcastPageProps) {
  const podcast = await prisma.podcast.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      presenter: true,
    },
  });

  if (!podcast) {
    notFound();
  }

  return <PodcastDetailClient podcast={podcast} />;
}
