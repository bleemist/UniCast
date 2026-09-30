import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsManagementClient } from "@/components/admin/NewsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <NewsManagementClient
      initialArticles={articles as any}
      categories={categories}
    />
  );
}
