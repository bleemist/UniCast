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

  const [settings, programmes, requests] = await Promise.all([
    prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    }),
    prisma.programme.findMany({
      include: { presenter: true, category: true },
      orderBy: { title: "asc" },
    }),
    prisma.songRequest.findMany({
      where: { status: { in: ["PENDING", "APPROVED"] } },
      include: { university: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <BroadcastControlClient
      initialSettings={settings}
      programmes={programmes}
      initialRequests={requests}
      user={session}
    />
  );
}
