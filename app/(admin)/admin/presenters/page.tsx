import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PresenterManagementClient } from "@/components/admin/PresenterManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminPresentersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const presenters = await prisma.presenter.findMany({
    where: { isArchived: false },
    include: {
      programmes: {
        select: { id: true, title: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return <PresenterManagementClient initialPresenters={presenters} />;
}
