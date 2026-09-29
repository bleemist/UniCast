"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { Play, Pause, Radio, Calendar, Music, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AudioVisualizer } from "@/components/ui/AudioVisualizer";
import { cn } from "@/lib/utils";

interface HomeLivePlayerHeroProps {
  currentShow: {
    id: string;
    title: string;
    tagline: string;
    coverImage: string;
    presenter: {
      name: string;
      avatar: string;
      roleTitle: string;
    };
    category: {
      name: string;
      color: string;
    };
  } | null;
}

export function HomeLivePlayerHero({ currentShow }: HomeLivePlayerHeroProps) {
  const { isPlaying, isLoading, playLiveStream, pause, streamOnline } =
    useAudioPlayer();

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      playLiveStream();
    }
  };

  const showTitle = currentShow ? currentShow.title : "Campus Pulse 107";
  const showTagline = currentShow
    ? currentShow.tagline
    : "The heartbeat of Kyambogo University. Student discussions, hot music, and campus headlines.";
  const presenterName = currentShow ? currentShow.presenter.name : "Brenda Nabirye";
  const presenterAvatar = currentShow
    ? currentShow.presenter.avatar
    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80";
  const coverImage = currentShow
    ? currentShow.coverImage
    : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900 border-b border-navy-800/80 pt-8 pb-14 md:py-16">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-radio-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Radio Headline & Show Information */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-850 border border-navy-750 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-live animate-ping" />
              <span className="font-semibold text-white">LIVE BROADCAST</span>
              <span className="text-slate-500">•</span>
              <span className="text-radio-400 font-mono">107.4 FM KAMPALA</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                The Sound of <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-radio-400 via-cyan-300 to-white bg-clip-text text-transparent">
                  Kyambogo University
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tune in to official campus news, faculty debates, varsity sports,
                and high-energy music directly from the university radio studio.
              </p>
            </div>

            {/* Current Show Details Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-navy-850/80 border border-navy-750 backdrop-blur-sm max-w-xl mx-auto lg:mx-0 text-left flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-navy-800 border border-navy-700 flex-shrink-0">
                  <Image
                    src={coverImage}
                    alt={showTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="live" size="sm">
                      ON AIR NOW
                    </Badge>
                    <span className="text-xs text-slate-400 truncate">
                      with {presenterName}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                    {showTitle}
                  </h3>
                </div>
              </div>

              {isPlaying && (
                <div className="hidden sm:flex items-center gap-1">
                  <AudioVisualizer isPlaying={isPlaying} barCount={5} size="sm" />
                </div>
              )}
            </div>

            {/* Play Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant={isPlaying ? "secondary" : "live"}
                size="lg"
                onClick={handlePlayToggle}
                leftIcon={
                  isPlaying ? (
                    <Pause className="w-5 h-5 fill-current text-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-current text-white ml-0.5" />
                  )
                }
                className={cn(
                  "w-full sm:w-auto px-8 font-bold text-base",
                  !isPlaying && "glow-live"
                )}
              >
                {isLoading
                  ? "Connecting to Studio..."
                  : isPlaying
                  ? "Pause Broadcast"
                  : "LISTEN LIVE NOW"}
              </Button>

              <Link href="/requests" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Music className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Request Song / Shoutout
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Studio Display Card */}
          <div className="lg:col-span-5 relative max-w-md mx-auto w-full">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-navy-700/80 shadow-2xl bg-navy-850 group">
              <Image
                src={coverImage}
                alt="Kyambogo Radio On-Air Studio"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

              {/* Status Header Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <Badge variant={streamOnline ? "live" : "offline"} size="md">
                  {streamOnline ? "● ON AIR" : "○ OFFLINE"}
                </Badge>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-navy-950/80 text-radio-300 border border-navy-800 backdrop-blur-md">
                  107.4 FM
                </span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-radio-400">
                    <Image
                      src={presenterAvatar}
                      alt={presenterName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">
                      {showTitle}
                    </h4>
                    <p className="text-xs text-radio-300 font-medium">
                      Host: {presenterName}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-radio-400" />
                    Every Weekday
                  </span>
                  <Link
                    href="/live"
                    className="text-radio-400 hover:text-white font-medium flex items-center gap-1"
                  >
                    Full Studio Player →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
