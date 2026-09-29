import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Mic, Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ScheduleFilterTabs } from "./ScheduleFilterTabs";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Broadcast Schedule | UniCast",
  description:
    "Explore the complete 7-day broadcast schedule for UniCast. One shared timetable across universities.",
};

export default async function SchedulePage() {
  const schedules = await prisma.schedule.findMany({
    include: {
      programme: {
        include: {
          presenter: true,
          category: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Programme Lineup
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Broadcast Schedule
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Explore our single weekly timetable broadcasting live to students across all university campuses.
        </p>
      </div>

      {/* Interactive Tabs & Timetable */}
      <ScheduleFilterTabs schedules={schedules} />
    </div>
  );
}
