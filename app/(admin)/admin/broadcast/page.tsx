import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BroadcastControlClient } from "./BroadcastControlClient";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [settings, programmes] = await Promise.all([
    prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    }),
    prisma.programme.findMany({
      include: { presenter: true, category: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <BroadcastControlClient
        initialSettings={settings}
        programmes={programmes}
      />
    </div>
  );
}
