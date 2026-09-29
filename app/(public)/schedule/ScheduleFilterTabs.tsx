"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Mic, Play, Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { cn, formatTime12h, getDayLabel } from "@/lib/utils";

interface ScheduleFilterTabsProps {
  schedules: any[];
}

const TABS = [
  { key: "TODAY", label: "Today" },
  { key: "TOMORROW", label: "Tomorrow" },
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
];

export function ScheduleFilterTabs({ schedules }: ScheduleFilterTabsProps) {
  const [activeTab, setActiveTab] = React.useState("TODAY");
  const { playLiveStream } = useAudioPlayer();

  // Resolve day of week
  const getFilterDay = (tab: string): string => {
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const todayIndex = new Date().getDay();

    if (tab === "TODAY") return days[todayIndex];
    if (tab === "TOMORROW") return days[(todayIndex + 1) % 7];
    return tab;
  };

  const currentFilteredDay = getFilterDay(activeTab);

  const filtered = schedules.filter(
    (s) => s.dayOfWeek.toUpperCase() === currentFilteredDay
  );

  return (
    <div className="space-y-8">
      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-radio-500 text-navy-950 shadow-md shadow-radio-500/20"
                  : "bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-750"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Shows List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-850 border border-navy-800 space-y-3">
          <Clock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            No shows scheduled for {getDayLabel(currentFilteredDay)}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Our automated music playlist and campus jingles will broadcast throughout this period.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const isSampleLive = activeTab === "TODAY" && idx === 1;

            return (
              <Card
                key={item.id}
                className={cn(
                  "border transition-all duration-200",
                  isSampleLive
                    ? "border-radio-500/50 bg-navy-800/90 shadow-lg shadow-radio-500/10"
                    : "border-navy-800 bg-navy-850/60 hover:border-navy-700"
                )}
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Cover thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-navy-900 border border-navy-700 flex-shrink-0">
                      <Image
                        src={item.programme.coverImage}
                        alt={item.programme.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isSampleLive && (
                          <Badge variant="live" size="sm">
                            ON AIR NOW
                          </Badge>
                        )}
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy-900 text-radio-300 border border-navy-700">
                          {formatTime12h(item.startTime)} -{" "}
                          {formatTime12h(item.endTime)}
                        </span>
                        <Badge variant="category" size="sm">
                          {item.programme.category.name}
                        </Badge>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white truncate">
                        {item.programme.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.programme.tagline}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                        <Mic className="w-3.5 h-3.5 text-radio-400" />
                        <span>Presenter: <strong className="text-slate-200">{item.programme.presenter.name}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Button
                      variant={isSampleLive ? "live" : "secondary"}
                      size="sm"
                      onClick={playLiveStream}
                      leftIcon={<Play className="w-4 h-4 fill-current" />}
                    >
                      {isSampleLive ? "Listen On Air" : "Tune In"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
