"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import {
  Play,
  Pause,
  Radio,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Calendar,
  AlertTriangle,
  Headphones,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AudioVisualizer } from "@/components/ui/AudioVisualizer";
import { UniversitySelectorModal } from "@/components/university/UniversitySelectorModal";
import { getSelectedUniversity } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ListenPlayerClientProps {
  currentSchedule: any;
  upcomingSchedules: any[];
  todaySchedules: any[];
  latestPodcasts: any[];
  recentRequests: any[];
}

export function ListenPlayerClient({
  currentSchedule,
  upcomingSchedules,
  todaySchedules,
  latestPodcasts,
  recentRequests,
}: ListenPlayerClientProps) {
  const {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    streamOnline,
    playLiveStream,
    pause,
    setVolume,
    toggleMute,
  } = useAudioPlayer();

  const [selectedUni, setSelectedUni] = React.useState<{ id: string; name: string } | null>(null);
  const [uniModalOpen, setUniModalOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedUni(getSelectedUniversity());
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      playLiveStream();
    }
  };

  const show = currentSchedule?.programme;
  const showTitle = show?.title || "Morning Campus Pulse";
  const showTagline =
    show?.tagline || "Your Campus Pulse. Uniting students across universities with live broadcasts and top hits.";
  const presenterName = show?.presenter?.name || "Brian Kigozi";
  const presenterAvatar =
    show?.presenter?.avatar ||
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80";
  const showCover =
    show?.coverImage ||
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80";

  const nextShow = upcomingSchedules[0]?.programme;

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Studio Banner & University Audience Tag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-live animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              UniCast Master Broadcast Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight">
            UniCast Live Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your Campus Pulse • One single broadcast stream serving all universities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* University listener indicator */}
          <button
            type="button"
            onClick={() => setUniModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs text-slate-200 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-radio-400" />
            <span>
              {selectedUni ? (
                <>Listening from: <strong className="text-white">{selectedUni.name}</strong></>
              ) : (
                <>Select your campus</>
              )}
            </span>
            <span className="text-[10px] text-radio-400 font-bold ml-1">Change</span>
          </button>

          <Badge variant={streamOnline ? "live" : "offline"} size="md">
            {streamOnline ? "● LIVE ON AIR" : "○ STUDIO STANDBY"}
          </Badge>
        </div>
      </div>

      {/* Main Studio Audio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left 7 Cols: Big Interactive Player */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-navy-750 bg-navy-850/80 overflow-hidden shadow-2xl relative">
            <div className="relative h-48 sm:h-80 w-full bg-navy-950">
              <Image
                src={showCover}
                alt={showTitle}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />

              <div className="absolute top-4 left-4">
                <Badge variant={streamOnline ? "live" : "offline"} size="md">
                  {streamOnline ? "BROADCASTING NATIONWIDE" : "STUDIO STANDBY"}
                </Badge>
              </div>

              {isPlaying && (
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AudioVisualizer isPlaying={isPlaying} barCount={8} size="md" />
                    <span className="text-xs font-semibold text-radio-300 ml-2">
                      Live Stream Audio Active
                    </span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
                    Current Programme
                  </span>
                  {show?.category && (
                    <Badge variant="category" size="sm">
                      {show.category.name}
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {showTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {showTagline}
                </p>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-navy-750 text-xs text-slate-300">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-radio-400 flex-shrink-0">
                    <Image
                      src={presenterAvatar}
                      alt={presenterName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="block font-semibold text-white">Host: {presenterName}</span>
                    <span className="text-[11px] text-slate-400">UniCast On-Air Team</span>
                  </div>
                </div>
              </div>

              {!streamOnline && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-white">Broadcast Mount Point Standby</h5>
                    <p className="mt-1 text-slate-300 leading-relaxed">
                      The streaming server mount point is waiting for the broadcast ingestion feed. Listen to recorded podcasts below in the meantime!
                    </p>
                  </div>
                </div>
              )}

              {/* Big Primary Control Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleToggle}
                    disabled={!streamOnline && !isPlaying}
                    aria-label={isPlaying ? "Pause Broadcast" : "Play Broadcast"}
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400 flex-shrink-0 cursor-pointer",
                      isPlaying
                        ? "bg-radio-500 hover:bg-radio-400 text-navy-950 shadow-xl shadow-radio-500/30"
                        : !streamOnline
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-live hover:bg-red-600 text-white shadow-xl glow-live hover:scale-105"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>

                  <div>
                    <span className="text-sm font-bold text-white block">
                      {isPlaying
                        ? "Transmitting Live"
                        : streamOnline
                        ? "Tap to Listen Live"
                        : "Broadcast Offline"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {streamOnline
                        ? "High-Definition 128kbps Stream"
                        : "Awaiting next live transmission"}
                    </span>
                  </div>
                </div>

                {/* Volume Bar */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-red-400" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    aria-label="Volume slider"
                    className="w-24 sm:w-32 h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-radio-400 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Up Next & Song Requests */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Show */}
          {nextShow && (
            <Card className="border-navy-800 bg-navy-850/70">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Up Next on UniCast
                  </span>
                  <Badge variant="category" size="sm">
                    {nextShow.category?.name || "Campus"}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white">
                  {nextShow.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {nextShow.tagline}
                </p>
                <div className="pt-2 border-t border-navy-750 flex items-center justify-between text-xs text-slate-400">
                  <span>Host: {nextShow.presenter?.name}</span>
                  <Link
                    href="/schedule"
                    className="text-radio-400 hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Full Schedule
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interactive Request CTA */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-radio-950/80 via-navy-850 to-navy-900 border border-radio-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-radio-400" />
              <h3 className="text-base font-bold text-white">
                Request a Song on UniCast
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Want the DJ to spin your track or read a shoutout to your university hall? Send your request directly to the on-air presenter desk.
            </p>
            <Link href="/request" className="block">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Music className="w-4 h-4" />}
                className="w-full justify-center"
              >
                Send Request to Studio
              </Button>
            </Link>
          </div>

          {/* Fallback Podcasts if Offline */}
          {latestPodcasts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-radio-400" />
                Featured On-Demand Podcasts
              </h4>
              {latestPodcasts.map((pod) => (
                <div
                  key={pod.id}
                  className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1.5"
                >
                  <h5 className="text-xs font-semibold text-white truncate">
                    {pod.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {pod.description}
                  </p>
                  <Link
                    href={`/podcasts/${pod.slug}`}
                    className="text-xs text-radio-400 hover:underline inline-block pt-1"
                  >
                    Play Episode →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UniversitySelectorModal
        isOpen={uniModalOpen}
        onClose={() => setUniModalOpen(false)}
        onSelected={(uni) => setSelectedUni(uni)}
      />
    </div>
  );
}
