import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Shield, Key } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Access Control
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Users & Role Permissions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          RBAC configuration: Super Admin, Radio Admin, Presenter, and Editor accounts.
        </p>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="border-navy-800 bg-navy-850/80 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{u.name}</h4>
                  <Badge variant="category" size="sm">{u.role}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Created: {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
