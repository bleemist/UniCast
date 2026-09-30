import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProgrammeManagementClient } from "@/components/admin/ProgrammeManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminProgrammesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [programmes, categories, presenters] = await Promise.all([
    prisma.programme.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        presenter: true,
        schedules: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.programmeCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.presenter.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ProgrammeManagementClient
      initialProgrammes={programmes}
      categories={categories}
      presenters={presenters}
    />
  );
}
