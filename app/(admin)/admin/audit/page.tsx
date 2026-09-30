import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditLogsClient } from "@/components/admin/AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return <AuditLogsClient initialLogs={logs as any} />;
}
