"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Clock, Radio } from "lucide-react";

export function AdminHeader() {
  const [timeString, setTimeString] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Africa/Kampala",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-navy-800 bg-navy-950/70 backdrop-blur-md px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white">
          Kyambogo Radio 107.4 FM • Studio Management
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Studio Realtime Clock (East Africa Time) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-radio-400" />
          <span>{timeString || "12:00:00 PM"} EAT</span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Station Stream:</span>
          </div>
          <Badge variant="online" size="sm">
            READY
          </Badge>
        </div>
      </div>
    </header>
  );
}
