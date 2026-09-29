import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const articles = await prisma.article.findMany({
    include: { category: true, author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Journalism Desk
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          News & Articles
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Radio editorial stories, campus headlines, and features.
        </p>
      </div>

      {articles.length === 0 ? (
        <Card className="border-navy-800 bg-navy-850/60 p-12 text-center">
          <Newspaper className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No articles published yet</h3>
          <p className="text-xs text-slate-400">
            Articles written by editors will be listed here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((art) => (
            <Card key={art.id} className="border-navy-800 bg-navy-850/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{art.title}</h4>
                  <p className="text-xs text-slate-400">
                    Category: {art.category.name} • By {art.author.name}
                  </p>
                </div>
                <Badge variant={art.isPublished ? "online" : "offline"} size="sm">
                  {art.isPublished ? "PUBLISHED" : "DRAFT"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
