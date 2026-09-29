"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Menu, X, Play, Volume2, Search } from "lucide-react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listen", label: "Listen Live" },
  { href: "/schedule", label: "Schedule" },
  { href: "/programmes", label: "Programmes" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/news", label: "News" },
  { href: "/presenters", label: "Presenters" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { isPlaying, playLiveStream, streamOnline } = useAudioPlayer();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global Ctrl+K / Cmd+K shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-navy-950/90 border-b border-navy-700/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400 rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-radio-600 via-radio-500 to-cyan-300 p-0.5 shadow-lg shadow-radio-500/20 group-hover:shadow-radio-500/35 transition-all">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-radio-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  KYAMBOGO<span className="text-radio-400">RADIO</span>
                </span>
                <Badge variant="gold" size="sm">
                  107.4 FM
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                The Voice of Kyambogo University
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 bg-navy-900/60 border border-navy-800 rounded-full px-3 py-1.5"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-radio-500 text-navy-950 font-semibold shadow-sm shadow-radio-500/20"
                      : "text-slate-300 hover:text-white hover:bg-navy-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Search & Listen Live Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the radio platform"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-750 transition-colors text-xs"
            >
              <Search className="w-4 h-4 text-radio-400" />
              <span className="hidden xl:inline text-slate-400">Search</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-navy-900 border border-navy-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Listen Live CTA */}
            <Button
              size="sm"
              variant={isPlaying ? "secondary" : "live"}
              onClick={playLiveStream}
              leftIcon={
                isPlaying ? (
                  <Volume2 className="w-4 h-4 text-radio-400" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )
              }
              className="hidden sm:inline-flex font-semibold"
            >
              {isPlaying ? "On Air" : "Listen Live"}
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2.5 rounded-lg bg-navy-850 border border-navy-700 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 bg-navy-950/98 border-b border-navy-700/80 p-5 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-navy-900 border border-navy-750 text-slate-300 text-sm mb-2"
              >
                <Search className="w-4 h-4 text-radio-400" />
                <span>Search programmes, news, podcasts...</span>
              </button>

              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-radio-500/15 text-radio-300 font-semibold border border-radio-500/30"
                        : "text-slate-300 hover:text-white hover:bg-navy-850"
                    )}
                  >
                    <span>{link.label}</span>
                    {link.href === "/listen" && (
                      <Badge variant={streamOnline ? "live" : "offline"} size="sm">
                        {streamOnline ? "LIVE" : "OFFLINE"}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-navy-800 space-y-2">
                <Button
                  variant="live"
                  size="lg"
                  onClick={() => {
                    playLiveStream();
                    setMobileMenuOpen(false);
                  }}
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  className="w-full justify-center"
                >
                  Listen Live Now (107.4 FM)
                </Button>

                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-400">
                  <Link href="/request" className="hover:text-radio-400">
                    Request Song
                  </Link>
                  <span>•</span>
                  <Link href="/about" className="hover:text-radio-400">
                    About Radio
                  </Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-radio-400">
                    Contact Us
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
