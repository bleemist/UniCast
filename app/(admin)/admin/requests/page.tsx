import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RequestQueueClient } from "./RequestQueueClient";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const requests = await prisma.songRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <RequestQueueClient initialRequests={requests} />
    </div>
  );
}
