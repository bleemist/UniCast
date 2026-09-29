import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Campus Alerts
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Radio Announcements & Notices
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Emergency notifications, university guild notices, and on-air station alerts.
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card className="border-navy-800 bg-navy-850/60 p-12 text-center">
          <Bell className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No active announcements</h3>
          <p className="text-xs text-slate-400">
            Station announcements will be broadcasted to listeners from here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className="border-navy-800 bg-navy-850/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                </div>
                <Badge variant={ann.isActive ? "live" : "offline"} size="sm">
                  {ann.priority}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
