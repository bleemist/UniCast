"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { Play, Pause, Headphones, Clock, Calendar, ArrowLeft, Mic, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PodcastDetailClientProps {
  podcast: any;
}

export function PodcastDetailClient({ podcast }: PodcastDetailClientProps) {
  const { currentTrack, isPlaying, playTrack, pause } = useAudioPlayer();

  const isCurrentPodcastPlaying =
    isPlaying && currentTrack?.audioUrl === podcast.audioUrl;

  const handlePlayToggle = () => {
    if (isCurrentPodcastPlaying) {
      pause();
    } else {
      playTrack({
        title: podcast.title,
        subtitle: `Host: ${podcast.presenter.name} • ${podcast.category.name}`,
        artwork: podcast.coverImage,
        isLive: false,
        audioUrl: podcast.audioUrl,
      });
    }
  };

  const minutes = Math.floor(podcast.duration / 60);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
      <div>
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Recorded Podcasts</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Cover Image */}
        <div className="md:col-span-5">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-navy-700 shadow-2xl bg-navy-850">
            <Image
              src={podcast.coverImage}
              alt={podcast.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge variant="category" size="md">
                {podcast.category.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Podcast Info & Playback */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-radio-400" />
                {minutes} Minutes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(podcast.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {podcast.title}
            </h1>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {podcast.description}
          </p>

          {/* Big Play Button */}
          <div className="pt-2">
            <Button
              variant={isCurrentPodcastPlaying ? "secondary" : "live"}
              size="lg"
              onClick={handlePlayToggle}
              leftIcon={
                isCurrentPodcastPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )
              }
              className="px-8 font-bold"
            >
              {isCurrentPodcastPlaying ? "Pause Episode" : "Play Episode Now"}
            </Button>
          </div>

          {/* Host Card */}
          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750 flex items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-radio-400 flex-shrink-0">
                <Image
                  src={podcast.presenter.avatar}
                  alt={podcast.presenter.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-radio-400 block">
                  Hosted By
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {podcast.presenter.name}
                </span>
              </div>
            </div>

            <Link
              href={`/presenters/${podcast.presenter.slug}`}
              className="text-xs text-radio-400 hover:underline font-medium"
            >
              View Host →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
