"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Radio,
  Mic,
  Headphones,
  Newspaper,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any>({
    programmes: [],
    presenters: [],
    podcasts: [],
    articles: [],
  });
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ programmes: [], presenters: [], podcasts: [], articles: [] });
      setTotalCount(0);
    }
  }, [isOpen]);

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ programmes: [], presenters: [], podcasts: [], articles: [] });
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-navy-750 gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shows, presenters, podcasts, news..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-radio-400 animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">
              ESC
            </span>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {query.trim().length >= 2 && totalCount === 0 && !isLoading && (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">
                No matching results found for "{query}"
              </p>
              <p className="text-xs text-slate-400">
                Try searching for show names, hosts, or campus topics.
              </p>
            </div>
          )}

          {/* 1. Programmes Results */}
          {results.programmes.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-radio-400 flex items-center gap-1.5 px-2">
                <Radio className="w-3.5 h-3.5" />
                Radio Programmes
              </span>
              <div className="space-y-1">
                {results.programmes.map((prog: any) => (
                  <Link
                    key={prog.id}
                    href={`/programmes/${prog.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-navy-800 flex-shrink-0">
                        <Image
                          src={prog.coverImage}
                          alt={prog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-radio-300 truncate">
                          {prog.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {prog.tagline}
                        </p>
                      </div>
                    </div>
                    <Badge variant="category" size="sm">
                      {prog.category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. Presenters Results */}
          {results.presenters.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 px-2">
                <Mic className="w-3.5 h-3.5" />
                Presenters & Hosts
              </span>
              <div className="space-y-1">
                {results.presenters.map((pres: any) => (
                  <Link
                    key={pres.id}
                    href={`/presenters/${pres.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-navy-800 flex-shrink-0">
                        <Image
                          src={pres.avatar}
                          alt={pres.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-radio-300 truncate">
                          {pres.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {pres.roleTitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Podcasts Results */}
          {results.podcasts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 px-2">
                <Headphones className="w-3.5 h-3.5" />
                Podcasts & Recordings
              </span>
              <div className="space-y-1">
                {results.podcasts.map((pod: any) => (
                  <Link
                    key={pod.id}
                    href={`/podcasts/${pod.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-navy-800 flex-shrink-0">
                        <Image
                          src={pod.coverImage}
                          alt={pod.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-radio-300 truncate">
                          {pod.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          Host: {pod.presenter.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {Math.floor(pod.duration / 60)} min
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. News Articles Results */}
          {results.articles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-2">
                <Newspaper className="w-3.5 h-3.5" />
                Radio News & Articles
              </span>
              <div className="space-y-1">
                {results.articles.map((art: any) => (
                  <Link
                    key={art.id}
                    href={`/news/${art.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-navy-800 flex-shrink-0">
                        <Image
                          src={art.coverImage}
                          alt={art.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-radio-300 truncate">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {art.excerpt}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
