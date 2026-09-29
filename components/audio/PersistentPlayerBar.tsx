"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAudioPlayer } from "./AudioPlayerContext";
import { AudioVisualizer } from "@/components/ui/AudioVisualizer";
import { Badge } from "@/components/ui/Badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Radio,
  Loader2,
  Maximize2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PersistentPlayerBar() {
  const {
    state,
    isPlaying,
    isLoading,
    isLiveStream,
    currentTrack,
    volume,
    isMuted,
    streamOnline,
    togglePlay,
    setVolume,
    toggleMute,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const renderStateBadge = () => {
    if (isLiveStream) {
      if (!streamOnline) {
        return (
          <Badge variant="offline" size="sm">
            OFFLINE
          </Badge>
        );
      }
      if (isLoading) {
        return (
          <Badge variant="pending" size="sm">
            BUFFERING
          </Badge>
        );
      }
      if (isPlaying) {
        return (
          <Badge variant="live" size="sm">
            LIVE
          </Badge>
        );
      }
      return (
        <Badge variant="online" size="sm">
          READY
        </Badge>
      );
    }
    return (
      <Badge variant="category" size="sm">
        PODCAST
      </Badge>
    );
  };

  return (
    <aside
      aria-label="Global Radio Player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/98 border-t border-navy-750/90 backdrop-blur-2xl shadow-2xl transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Track Info & Artwork */}
        <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs md:max-w-sm">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-navy-850 border border-navy-700 flex-shrink-0">
            {currentTrack.artwork ? (
              <Image
                src={currentTrack.artwork}
                alt={currentTrack.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-radio-400">
                <Radio className="w-6 h-6" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center">
                <AudioVisualizer isPlaying={isPlaying} barCount={4} size="sm" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </h4>
              <span className="hidden sm:inline">{renderStateBadge()}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
              {currentTrack.subtitle}
            </p>
          </div>
        </div>

        {/* Center Section: Playback Controls */}
        <div className="flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={isLiveStream && !streamOnline && !isPlaying}
              aria-label={isPlaying ? "Pause Broadcast" : "Play Broadcast"}
              className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400 flex-shrink-0 cursor-pointer",
                isPlaying
                  ? "bg-radio-500 hover:bg-radio-400 text-navy-950 shadow-lg shadow-radio-500/25"
                  : isLiveStream && !streamOnline
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-white hover:bg-slate-200 text-navy-950 shadow-md hover:scale-105"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-navy-950" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Offline warning under button if stream is disconnected */}
          {isLiveStream && !streamOnline && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
              <AlertCircle className="w-3 h-3" />
              Radio Offline
            </span>
          )}
        </div>

        {/* Right Section: Volume & Full Player Link */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 min-w-0">
          {/* Volume Slider on Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
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
              className="w-16 lg:w-24 h-1.5 bg-navy-750 rounded-lg appearance-none cursor-pointer accent-radio-400 focus:outline-none"
            />
          </div>

          {/* Full Listen Page Link */}
          <Link
            href="/listen"
            aria-label="Open Full Live Studio Player"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-750 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Maximize2 className="w-4 h-4 text-radio-400" />
            <span className="hidden sm:inline">Studio Player</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
