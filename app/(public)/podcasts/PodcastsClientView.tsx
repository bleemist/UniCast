"use client";

import * as React from "react";
import Image from "next/image";
import { Headphones, Play, Search, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { formatDuration } from "@/lib/utils";

interface PodcastsClientViewProps {
  podcasts: any[];
  categories: any[];
}

export function PodcastsClientView({
  podcasts,
  categories,
}: PodcastsClientViewProps) {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const filtered = podcasts.filter((pod) => {
    const matchesSearch =
      pod.title.toLowerCase().includes(search.toLowerCase()) ||
      pod.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || pod.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayPodcast = (pod: any) => {
    playTrack({
      title: pod.title,
      subtitle: `${pod.presenter.name} • Podcast`,
      artwork: pod.coverImage,
      isLive: false,
      audioUrl: pod.audioUrl,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            On-Demand Audio
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Podcasts & Recorded Shows
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Missed a live broadcast? Catch up on university debates, guest interviews, and campus specials anytime.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "ALL"
                ? "bg-radio-500 text-navy-950 font-bold"
                : "bg-navy-850 text-slate-300 hover:text-white border border-navy-750"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-radio-500 text-navy-950 font-bold"
                  : "bg-navy-850 text-slate-300 hover:text-white border border-navy-750"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-850 border border-navy-800 space-y-2">
          <Headphones className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No episodes found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search keywords or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pod) => {
            const isThisPlaying =
              isPlaying && currentTrack?.audioUrl === pod.audioUrl;

            return (
              <Card
                key={pod.id}
                className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-navy-900 overflow-hidden group">
                    <Image
                      src={pod.coverImage}
                      alt={pod.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="category" size="sm">
                        {pod.category.name}
                      </Badge>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-navy-950/80 text-slate-300 border border-navy-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-radio-400" />
                        {formatDuration(pod.duration)}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {pod.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {pod.description}
                    </p>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-navy-750/60 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-navy-700">
                      <Image
                        src={pod.presenter.avatar}
                        alt={pod.presenter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">
                      {pod.presenter.name}
                    </span>
                  </div>

                  <Button
                    variant={isThisPlaying ? "live" : "primary"}
                    size="sm"
                    onClick={() => handlePlayPodcast(pod)}
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    {isThisPlaying ? "Playing" : "Play Episode"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
