import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Layers, Plus, Calendar, Clock, Mic } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminProgrammesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const programmes = await prisma.programme.findMany({
    include: {
      category: true,
      presenter: true,
      schedules: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Programming Roster
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Radio Programmes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage shows, recurring time slots, assigned hosts, and cover art.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programmes.map((prog) => (
          <Card
            key={prog.id}
            className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-navy-900 overflow-hidden">
                <Image
                  src={prog.coverImage}
                  alt={prog.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="category" size="sm">
                    {prog.category.name}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-2">
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {prog.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {prog.tagline}
                </p>

                <div className="pt-2 border-t border-navy-750 flex items-center gap-2 text-xs text-slate-300">
                  <Mic className="w-3.5 h-3.5 text-radio-400" />
                  <span>Host: <strong>{prog.presenter.name}</strong></span>
                </div>

                <div className="text-xs text-slate-400">
                  <span>Scheduled Slots: <strong>{prog.schedules.length} active</strong></span>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
