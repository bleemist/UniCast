import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScheduleManagementClient } from "@/components/admin/ScheduleManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [schedules, programmes] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        programme: {
          include: { presenter: true, category: true },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.programme.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        title: true,
        presenter: { select: { name: true } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <ScheduleManagementClient
      initialSchedules={schedules as any}
      programmes={programmes}
    />
  );
}
