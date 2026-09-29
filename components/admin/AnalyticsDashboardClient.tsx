"use client";

import * as React from "react";
import {
  BarChart3,
  Users,
  Clock,
  GraduationCap,
  Activity,
  Layers,
  Calendar,
  Filter,
  RefreshCw,
  Compass,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface UniversityStat {
  universityId: string;
  universityName: string;
  shortName: string | null;
  listeners: number;
  sessions: number;
  avgDurationMinutes: number;
  percentage: number;
  lastSeenAt?: string | null;
}

interface TrendStat {
  label: string;
  sessions: number;
  listeners: number;
}

interface ProgrammeStat {
  programmeId: string;
  title: string;
  listeners: number;
  sessions: number;
  avgDurationMinutes: number;
}

interface AnalyticsData {
  hasData: boolean;
  activeListeners: number;
  totalListeners: number;
  totalSessions: number;
  avgSessionDurationSeconds: number;
  universitiesReached: number;
  universityAudience: UniversityStat[];
  listeningTrends: TrendStat[];
  programmeAnalytics: ProgrammeStat[];
}

export function AnalyticsDashboardClient({
  initialData,
}: {
  initialData: AnalyticsData;
}) {
  const [range, setRange] = React.useState<string>("7d");
  const [data, setData] = React.useState<AnalyticsData>(initialData);
  const [loading, setLoading] = React.useState<boolean>(false);

  const fetchAnalytics = React.useCallback(async (selectedRange: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/summary?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    fetchAnalytics(newRange);
  };

  const avgMinutes = Math.round(data.avgSessionDurationSeconds / 60);

  return (
    <div className="space-y-8">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Audience Measurement Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Listener & University Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real metrics derived directly from anonymous listener telemetry. Zero fabricated statistics.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-navy-850 border border-navy-750">
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
            { id: "all", label: "All Time" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRangeChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === tab.id
                  ? "bg-radio-500 text-navy-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-navy-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => fetchAnalytics(range)}
            aria-label="Refresh data"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-radio-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Listeners */}
        <Card className="border-navy-800 bg-navy-850/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Active Listeners</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {data.activeListeners}
          </h3>
          <p className="text-[11px] text-emerald-400">Concurrent live listeners</p>
        </Card>

        {/* Total Listeners */}
        <Card className="border-navy-800 bg-navy-850/80 p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Total Listeners
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {data.totalListeners}
          </h3>
          <p className="text-[11px] text-radio-400">Unique anonymous listeners</p>
        </Card>

        {/* Total Sessions */}
        <Card className="border-navy-800 bg-navy-850/80 p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Listening Sessions
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {data.totalSessions}
          </h3>
          <p className="text-[11px] text-slate-400">Total playback connections</p>
        </Card>

        {/* Avg Duration */}
        <Card className="border-navy-800 bg-navy-850/80 p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Avg Session Duration
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {avgMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </h3>
          <p className="text-[11px] text-cyan-300">Mean listening time</p>
        </Card>

        {/* Universities Reached */}
        <Card className="border-navy-800 bg-navy-850/80 p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Universities Reached
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {data.universitiesReached}
          </h3>
          <p className="text-[11px] text-purple-300">Campuses represented</p>
        </Card>
      </div>

      {/* Main Grid: University Audience Ranking & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Universities Ranked by Audience */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-navy-800 bg-navy-850/80">
            <CardHeader className="pb-4 border-b border-navy-750">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-radio-400" />
                    Listeners by University
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Audience breakdown measuring which campuses tune in to UniCast most.
                  </CardDescription>
                </div>
                <Link
                  href="/admin/analytics/universities"
                  className="text-xs text-radio-400 hover:underline flex items-center gap-1"
                >
                  Full report →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.universityAudience.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <GraduationCap className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-400">No listener data yet for this time range.</p>
                  <p className="text-[11px]">As listeners select their campuses, statistics will populate here.</p>
                </div>
              ) : (
                <div className="divide-y divide-navy-750">
                  {data.universityAudience.map((uni, idx) => (
                    <div
                      key={uni.universityId}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-6 text-center text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {uni.universityName}
                            </h4>
                            {uni.shortName && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-radio-300">
                                {uni.shortName}
                              </span>
                            )}
                          </div>
                          {/* Audience Percentage Bar */}
                          <div className="w-full sm:w-48 bg-navy-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-radio-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(uni.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-right">
                        <div>
                          <span className="font-bold text-white block">
                            {uni.listeners.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Listeners</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">
                            {uni.sessions.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Sessions</span>
                        </div>
                        <div>
                          <span className="font-bold text-radio-400 block">
                            {uni.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">Share</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Trends & Programme Engagement */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Listening Trend */}
          <Card className="border-navy-800 bg-navy-850/80">
            <CardHeader className="pb-3 border-b border-navy-750">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-sm font-semibold text-white">
                  Listening Volume Trend
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Daily sessions recorded during the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {data.listeningTrends.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No trend data available for this range.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end gap-2 h-32 pt-4 px-1 border-b border-navy-750">
                    {data.listeningTrends.map((t, i) => {
                      const maxSessions = Math.max(
                        ...data.listeningTrends.map((x) => x.sessions),
                        1
                      );
                      const heightPercent = Math.max(
                        Math.round((t.sessions / maxSessions) * 100),
                        8
                      );
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                        >
                          <div
                            className="w-full bg-radio-500/80 hover:bg-radio-400 rounded-t transition-all cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                            title={`${t.label}: ${t.sessions} sessions`}
                          />
                          <span className="text-[9px] text-slate-500 truncate block">
                            {t.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Past days in range</span>
                    <span className="text-radio-400 font-semibold">Sessions & Listeners</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Programme Performance */}
          <Card className="border-navy-800 bg-navy-850/80">
            <CardHeader className="pb-3 border-b border-navy-750">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-radio-400" />
                <CardTitle className="text-sm font-semibold text-white">
                  Programme Performance
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Listener counts per show where technically recorded.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {data.programmeAnalytics.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No programme analytics recorded yet.
                </p>
              ) : (
                data.programmeAnalytics.map((prog) => (
                  <div
                    key={prog.programmeId}
                    className="p-3 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="font-bold text-white truncate">{prog.title}</h5>
                      <span className="text-[11px] text-slate-400">
                        {prog.sessions} listening sessions
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-radio-400 block">
                        {prog.listeners} Listeners
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ~{prog.avgDurationMinutes}m avg
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
