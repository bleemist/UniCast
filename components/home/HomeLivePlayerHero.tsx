"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { Play, Pause, Radio, Calendar, Music, Sparkles, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AudioVisualizer } from "@/components/ui/AudioVisualizer";
import { UniversitySelectorModal } from "@/components/university/UniversitySelectorModal";
import { getSelectedUniversity } from "@/lib/analytics";
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
  const [selectedUni, setSelectedUni] = React.useState<{ id: string; name: string } | null>(null);
  const [uniModalOpen, setUniModalOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedUni(getSelectedUniversity());
  }, []);

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      playLiveStream();
    }
  };

  const showTitle = currentShow ? currentShow.title : "Morning Campus Pulse";
  const showTagline = currentShow
    ? currentShow.tagline
    : "Kickstart your university day with fresh headlines, academic banter, and high-energy music across campuses.";
  const presenterName = currentShow ? currentShow.presenter.name : "Brian Kigozi";
  const presenterAvatar = currentShow
    ? currentShow.presenter.avatar
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80";
  const coverImage = currentShow
    ? currentShow.coverImage
    : "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900 border-b border-navy-800/80 pt-6 pb-10 md:py-16">
        {/* Background radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-radio-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left Column: Radio Headline & Show Information */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-navy-850 border border-navy-750 text-[11px] sm:text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-live animate-ping" />
                  <span className="font-semibold text-white">LIVE ON AIR</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-radio-400 font-mono">UNICAST RADIO</span>
                </div>

                {/* University Listener Indicator Badge */}
                <button
                  type="button"
                  onClick={() => setUniModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-radio-500/10 hover:bg-radio-500/20 border border-radio-500/30 text-[11px] sm:text-xs text-radio-300 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-radio-400" />
                  <span>
                    {selectedUni ? (
                      <>Listening from: <strong>{selectedUni.name}</strong></>
                    ) : (
                      <>Select your campus</>
                    )}
                  </span>
                  <span className="text-[10px] text-radio-400">Change</span>
                </button>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  One Radio. <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-radio-400 via-cyan-300 to-white bg-clip-text text-transparent">
                    Every Campus.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  UniCast is the single university radio platform connecting students across all campuses. Tune in to live debates, varsity sports, student innovations, and hot hits.
                </p>
              </div>

              {/* Current Show Details Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-navy-850/80 border border-navy-750 backdrop-blur-sm max-w-xl mx-auto lg:mx-0 text-left flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-navy-800 border border-navy-700 flex-shrink-0">
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
                    "w-full sm:w-auto px-6 sm:px-8 font-bold text-base",
                    !isPlaying && "glow-live"
                  )}
                >
                  {isLoading
                    ? "Connecting to Studio..."
                    : isPlaying
                    ? "Pause Broadcast"
                    : "LISTEN LIVE NOW"}
                </Button>

                <Link href="/request" className="w-full sm:w-auto">
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
            <div className="lg:col-span-5 relative max-w-sm sm:max-w-md mx-auto w-full">
              <div className="relative aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden border border-navy-700/80 shadow-2xl bg-navy-850 group">
                <Image
                  src={coverImage}
                  alt="UniCast Studio Broadcast"
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
                    UniCast Live
                  </span>
                </div>

                {/* Bottom Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 space-y-3">
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
                      Daily Campus Lineup
                    </span>
                    <Link
                      href="/listen"
                      className="text-radio-400 hover:text-white font-medium flex items-center gap-1"
                    >
                      Studio Desk Player →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UniversitySelectorModal
        isOpen={uniModalOpen}
        onClose={() => setUniModalOpen(false)}
        onSelected={(uni) => setSelectedUni(uni)}
      />
    </>
  );
}
