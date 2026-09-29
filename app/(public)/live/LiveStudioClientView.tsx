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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AudioVisualizer } from "@/components/ui/AudioVisualizer";
import { cn } from "@/lib/utils";

interface LiveStudioClientViewProps {
  currentShow: any;
  upcomingShow: any;
  latestPodcasts: any[];
}

export function LiveStudioClientView({
  currentShow,
  upcomingShow,
  latestPodcasts,
}: LiveStudioClientViewProps) {
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

  const handleToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      playLiveStream();
    }
  };

  const showTitle = currentShow?.title || "Campus Pulse 107";
  const presenterName = currentShow?.presenter?.name || "Brenda Nabirye";
  const showCover =
    currentShow?.coverImage ||
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";

  return (
    <div className="space-y-10">
      {/* Studio Banner & Frequency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Official Live Stream Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kyambogo Radio 107.4 FM
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={streamOnline ? "live" : "offline"} size="md">
            {streamOnline ? "● ON AIR" : "○ RADIO OFFLINE"}
          </Badge>
          <span className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-xs font-mono font-bold text-slate-300">
            128 KBPS STEREO
          </span>
        </div>
      </div>

      {/* Main Studio Audio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Big Interactive Player */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-navy-700/80 bg-navy-850/80 overflow-hidden shadow-2xl relative">
            {/* Show Artwork with Overlay */}
            <div className="relative h-64 sm:h-80 w-full bg-navy-950">
              <Image
                src={showCover}
                alt={showTitle}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />

              {/* Top overlay badge */}
              <div className="absolute top-4 left-4">
                <Badge variant={streamOnline ? "live" : "offline"} size="md">
                  {streamOnline ? "BROADCASTING LIVE" : "STUDIO STANDBY"}
                </Badge>
              </div>

              {/* Bottom Visualizer */}
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

            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
                  Current Programme
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {showTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {currentShow?.tagline ||
                    "Direct from Kyambogo University Main Studio. Tuning in students across all campuses."}
                </p>
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-navy-750 text-xs text-slate-400">
                  <span>Host: <strong className="text-white">{presenterName}</strong></span>
                  <span>•</span>
                  <span>Frequency: <strong className="text-radio-300">107.4 FM & Web</strong></span>
                </div>
              </div>

              {/* Stream Offline Graceful Handler */}
              {!streamOnline && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-white">Radio Is Currently Offline</h5>
                    <p className="mt-1 text-slate-300 leading-relaxed">
                      The live studio broadcast is not currently transmitting.
                      Check the timetable below for the next scheduled show or listen to our recorded podcasts!
                    </p>
                  </div>
                </div>
              )}

              {/* Big Primary Control Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleToggle}
                    disabled={!streamOnline && !isPlaying}
                    aria-label={isPlaying ? "Pause Broadcast" : "Play Broadcast"}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400 flex-shrink-0 cursor-pointer",
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
                        ? "Streaming Live"
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
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
                    className="w-32 h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-radio-400 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Upcoming Show & On-Air Requests */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Show Card */}
          {upcomingShow && (
            <Card className="border-navy-800 bg-navy-850/70">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Up Next on 107.4 FM
                  </span>
                  <Badge variant="category" size="sm">
                    {upcomingShow.category?.name || "Campus"}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white">
                  {upcomingShow.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {upcomingShow.tagline}
                </p>
                <div className="pt-2 border-t border-navy-750 flex items-center justify-between text-xs text-slate-400">
                  <span>Host: {upcomingShow.presenter?.name}</span>
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-radio-950/80 via-navy-850 to-navy-900 border border-radio-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-radio-400" />
              <h3 className="text-base font-bold text-white">
                Request a Song on this Show
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Want the DJ to play your favourite tune or read out your shoutout?
              Send a request right now to the on-air presenter desk.
            </p>
            <Link href="/requests" className="block">
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
          {!streamOnline && latestPodcasts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-radio-400" />
                Listen While Waiting (Latest Podcasts)
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
                    href="/podcasts"
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
    </div>
  );
}
