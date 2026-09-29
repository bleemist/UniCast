import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Mic, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminPresentersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const presenters = await prisma.presenter.findMany({
    include: { programmes: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Staff Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Presenter Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Station on-air hosts, student broadcasters, and audio curators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {presenters.map((pres) => (
          <Card key={pres.id} className="border-navy-800 bg-navy-850/80 p-5">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-radio-500/40 flex-shrink-0">
                <Image src={pres.avatar} alt={pres.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{pres.name}</h3>
                <p className="text-xs text-radio-400 font-medium">{pres.roleTitle}</p>
                <Badge variant={pres.isActive ? "online" : "offline"} size="sm" className="mt-1">
                  {pres.isActive ? "Active Host" : "Inactive"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 line-clamp-3 leading-relaxed">
              {pres.bio}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
