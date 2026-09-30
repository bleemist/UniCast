import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserManagementClient } from "@/components/admin/UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <UserManagementClient
      initialUsers={users as any}
      currentUserId={session.id}
    />
  );
}
