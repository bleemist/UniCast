import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, Clock, Layers, Mic } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTime12h, getDayLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const schedules = await prisma.schedule.findMany({
    include: {
      programme: {
        include: { presenter: true, category: true },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Station Timetable
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Weekly Broadcast Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View on-air time allocations and prevent transmission schedule conflicts.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {schedules.map((item) => (
          <Card
            key={item.id}
            className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors"
          >
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-750 text-center min-w-[90px]">
                  <span className="text-[10px] uppercase font-bold text-radio-400 block">
                    {item.dayOfWeek.slice(0, 3)}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {item.startTime}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {item.programme.title}
                    </h3>
                    <Badge variant="category" size="sm">
                      {item.programme.category.name}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Host: {item.programme.presenter.name} • {formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant={item.isLive ? "live" : "neutral"} size="sm">
                  {item.isLive ? "LIVE BROADCAST" : "AUTOMATED"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
