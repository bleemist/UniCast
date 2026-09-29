import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Headphones, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPodcastsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const podcasts = await prisma.podcast.findMany({
    include: { presenter: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Media Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Podcasts & Recordings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Recorded studio programmes and on-demand student audio content.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {podcasts.map((pod) => (
          <Card key={pod.id} className="border-navy-800 bg-navy-850/80 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-navy-900 border border-navy-700 flex-shrink-0">
                  <Image src={pod.coverImage} alt={pod.title} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{pod.title}</h3>
                    <Badge variant="category" size="sm">{pod.category.name}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Host: {pod.presenter.name} • Duration: {formatDuration(pod.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant={pod.isPublished ? "online" : "offline"} size="sm">
                  {pod.isPublished ? "PUBLISHED" : "DRAFT"}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
