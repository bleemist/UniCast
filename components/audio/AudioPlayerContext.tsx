"use client";

import * as React from "react";
import {
  AudioPlayerContextType,
  AudioPlaybackState,
  TrackMetadata,
} from "@/types";
import {
  recordListenerEvent,
  sendListenerHeartbeat,
} from "@/lib/analytics";
import {
  STATION_NAME,
  STATION_TAGLINE,
  DEFAULT_STREAM_URL,
} from "@/lib/constants";

interface ExtendedAudioPlayerContextType extends AudioPlayerContextType {
  isLivePresenter: boolean;
  presenterName: string;
}

const AudioPlayerContext = React.createContext<ExtendedAudioPlayerContextType | null>(
  null
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const heartbeatTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = React.useRef<Promise<void> | null>(null);
  const isSwitchingRef = React.useRef<boolean>(false);

  const [state, setState] = React.useState<AudioPlaybackState>("idle");
  const [volume, setVolumeState] = React.useState<number>(0.85);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [streamOnline, setStreamOnline] = React.useState<boolean>(true);
  const [activeStreamUrl, setActiveStreamUrl] = React.useState<string>(DEFAULT_STREAM_URL);
  const [currentProgrammeTitle, setCurrentProgrammeTitle] = React.useState<string>("Morning Campus Pulse");
  const [isNetworkOffline, setIsNetworkOffline] = React.useState<boolean>(false);

  // Live Presenter & Automatic Music Switching State
  const [isLivePresenter, setIsLivePresenter] = React.useState<boolean>(false);
  const [presenterName, setPresenterName] = React.useState<string>("UniCast Host");
  const [automatedStreamUrl, setAutomatedStreamUrl] = React.useState<string>(DEFAULT_STREAM_URL);

  const [currentTrack, setCurrentTrack] = React.useState<TrackMetadata | null>({
    title: STATION_NAME,
    subtitle: STATION_TAGLINE,
    isLive: true,
    audioUrl: DEFAULT_STREAM_URL,
    artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
  });

  // Track the previous isLivePresenter to trigger seamless auto-transition
  const prevLivePresenterRef = React.useRef<boolean>(false);
  const stateRef = React.useRef<AudioPlaybackState>("idle");
  stateRef.current = state;

  /**
   * Safely play audio, guarding against the AbortError race condition.
   * Returns true if play succeeded, false otherwise.
   */
  const safePlay = React.useCallback(async (audio: HTMLAudioElement): Promise<boolean> => {
    // If a previous play() is still pending, wait for it to settle first
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // previous play was aborted or errored — that's fine
      }
      playPromiseRef.current = null;
    }

    try {
      const promise = audio.play();
      playPromiseRef.current = promise;
      await promise;
      playPromiseRef.current = null;
      return true;
    } catch (e: unknown) {
      playPromiseRef.current = null;
      const errorName = e instanceof Error ? e.name : "";
      // AbortError means play was interrupted (e.g. by pause or new src) — not a real error
      if (errorName === "AbortError") {
        return false;
      }
      console.warn("Audio play failed:", e);
      return false;
    }
  }, []);

  // Check stream status from API and detect presenter on-air changes
  const checkStreamStatus = React.useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/stream/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStreamOnline(data.isOnline);
        const liveNow = !!data.isLivePresenter;
        setIsLivePresenter(liveNow);

        if (data.presenterName) {
          setPresenterName(data.presenterName);
        }

        const autoUrl = data.automatedStreamUrl || DEFAULT_STREAM_URL;
        setAutomatedStreamUrl(autoUrl);

        // When no presenter is live, ALWAYS use the direct automated stream URL (Zeno.fm)
        // Never point at /api/stream/live when not broadcasting — that causes 400/redirect errors
        const targetStream = liveNow ? "/api/stream/live" : autoUrl;
        setActiveStreamUrl(targetStream);

        // Auto-switch audio if currently playing and presenter state changed
        const currentState = stateRef.current;
        const wasPlaying = currentState === "playing" || currentState === "loading" || currentState === "buffering";

        if (audioRef.current && wasPlaying && prevLivePresenterRef.current !== liveNow && !isSwitchingRef.current) {
          isSwitchingRef.current = true;
          console.log(`🔄 [UniCast] Switching to ${liveNow ? "Presenter Live" : "Automatic Music"}`);
          prevLivePresenterRef.current = liveNow;

          const updatedTrack: TrackMetadata = {
            title: liveNow
              ? `● LIVE: ${data.presenterName || "On Air"}`
              : `${STATION_NAME} • Live Campus Radio`,
            subtitle: liveNow
              ? "Direct Live Studio Broadcast"
              : STATION_TAGLINE,
            isLive: true,
            audioUrl: targetStream,
            artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
          };

          setCurrentTrack(updatedTrack);
          updateMediaSession(updatedTrack);

          const streamSrc = `${targetStream}${targetStream.includes("?") ? "&" : "?"}ts=${Date.now()}`;
          audioRef.current.src = streamSrc;
          const ok = await safePlay(audioRef.current);
          if (ok) setState("playing");
          isSwitchingRef.current = false;
        } else if (!wasPlaying) {
          prevLivePresenterRef.current = liveNow;
        }

        return data.isOnline;
      }
      return true;
    } catch {
      return true;
    }
  }, [safePlay]);

  // Stop heartbeat timer
  const stopHeartbeat = React.useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  // Start heartbeat timer
  const startHeartbeat = React.useCallback(() => {
    stopHeartbeat();
    sendListenerHeartbeat(undefined, 10);
    heartbeatTimerRef.current = setInterval(() => {
      sendListenerHeartbeat(undefined, 30);
    }, 30000);
  }, [stopHeartbeat]);

  // Update MediaSession API for mobile lock screens
  const updateMediaSession = React.useCallback(
    (track: TrackMetadata) => {
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.subtitle,
          album: STATION_NAME,
          artwork: [
            {
              src: track.artwork || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
              sizes: "512x512",
              type: "image/jpeg",
            },
          ],
        });

        navigator.mediaSession.setActionHandler("play", () => {
          togglePlay();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          pause();
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Initialize Audio Element and Network listeners
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => setState("buffering");
    const handleCanPlay = () => {
      const s = stateRef.current;
      if (s === "loading" || s === "buffering") setState("playing");
    };
    const handlePlaying = () => {
      setState("playing");
      startHeartbeat();
    };
    const handlePause = () => {
      setState("paused");
      stopHeartbeat();
    };
    const handleError = () => {
      // Only set error state if we were actually trying to play
      const s = stateRef.current;
      if (s === "loading" || s === "playing" || s === "buffering") {
        setState("error");
        stopHeartbeat();
      }
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Network offline/online listeners
    const handleOnline = () => {
      setIsNetworkOffline(false);
      checkStreamStatus();
    };
    const handleOffline = () => {
      setIsNetworkOffline(true);
      const s = stateRef.current;
      if (s === "playing") {
        audio.pause();
        setState("offline");
        stopHeartbeat();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial stream health check + 15-second polling (reduced from 4s to avoid race conditions)
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 15000);

    return () => {
      clearInterval(interval);
      stopHeartbeat();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [checkStreamStatus, startHeartbeat, stopHeartbeat]);

  const playLiveStream = React.useCallback(async () => {
    if (!navigator.onLine) {
      setIsNetworkOffline(true);
      setState("offline");
      return;
    }

    // Quick status check to know if presenter is currently live
    let livePresenterNow = isLivePresenter;
    let targetStream = activeStreamUrl;
    let currentHost = presenterName;

    try {
      const res = await fetch("/api/stream/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        livePresenterNow = !!data.isLivePresenter;
        setIsLivePresenter(livePresenterNow);
        prevLivePresenterRef.current = livePresenterNow;
        if (data.presenterName) {
          currentHost = data.presenterName;
          setPresenterName(currentHost);
        }
        // Use direct stream URL when no presenter is live (avoid /api/stream/live redirect)
        targetStream = livePresenterNow
          ? "/api/stream/live"
          : data.automatedStreamUrl || data.streamUrl || DEFAULT_STREAM_URL;
        setActiveStreamUrl(targetStream);
      }
    } catch {
      // Fall back to the direct automated stream URL
      targetStream = DEFAULT_STREAM_URL;
    }

    const liveTrack: TrackMetadata = {
      title: livePresenterNow
        ? `● LIVE: ${currentHost}`
        : `${STATION_NAME} • Live Broadcast`,
      subtitle: livePresenterNow
        ? "Direct Live Studio Presentation"
        : STATION_TAGLINE,
      isLive: true,
      audioUrl: targetStream,
      artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
    };

    setCurrentTrack(liveTrack);
    updateMediaSession(liveTrack);

    if (audioRef.current) {
      setState("loading");
      audioRef.current.muted = isMuted;
      const streamSrc = `${targetStream}${targetStream.includes("?") ? "&" : "?"}ts=${Date.now()}`;
      audioRef.current.src = streamSrc;

      const ok = await safePlay(audioRef.current);
      if (ok) {
        setState("playing");
        recordListenerEvent("LISTEN_STARTED", undefined, { isLive: true, livePresenterNow });
        startHeartbeat();
      } else {
        // Only set error if we're still in loading state (not if user paused)
        const s = stateRef.current;
        if (s === "loading") {
          setState("error");
        }
      }
    }
  }, [activeStreamUrl, isLivePresenter, isMuted, presenterName, safePlay, startHeartbeat, updateMediaSession]);

  const playTrack = React.useCallback(
    (track: TrackMetadata) => {
      if (!navigator.onLine) {
        setIsNetworkOffline(true);
        setState("offline");
        return;
      }

      setCurrentTrack(track);
      updateMediaSession(track);

      if (audioRef.current) {
        setState("loading");
        audioRef.current.src = track.audioUrl;
        safePlay(audioRef.current).then((ok) => {
          if (ok) {
            setState("playing");
            recordListenerEvent(track.isLive ? "LISTEN_STARTED" : "PODCAST_PLAYED", undefined, {
              title: track.title,
            });
            startHeartbeat();
          } else {
            const s = stateRef.current;
            if (s === "loading") setState("error");
          }
        });
      }
    },
    [safePlay, startHeartbeat, updateMediaSession]
  );

  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (currentTrack?.isLive) {
        audioRef.current.src = "";
      }
      setState("paused");
      stopHeartbeat();
      recordListenerEvent("LISTEN_PAUSED");
    }
  }, [currentTrack, stopHeartbeat]);

  const togglePlay = React.useCallback(() => {
    if (state === "playing") {
      pause();
    } else {
      if (currentTrack) {
        if (currentTrack.isLive) {
          playLiveStream();
        } else {
          playTrack(currentTrack);
        }
      } else {
        playLiveStream();
      }
    }
  }, [state, currentTrack, pause, playLiveStream, playTrack]);

  const setVolume = React.useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleMute = React.useCallback(() => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioRef.current.muted = newMute;
  }, [isMuted]);

  const value: ExtendedAudioPlayerContextType = {
    state,
    isPlaying: state === "playing",
    isLoading: state === "loading" || state === "buffering",
    isLiveStream: !!currentTrack?.isLive,
    currentTrack,
    volume,
    isMuted,
    streamOnline,
    currentProgrammeTitle,
    isLivePresenter,
    presenterName,
    playLiveStream,
    playTrack,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    checkStreamStatus,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {isNetworkOffline && (
        <div className="bg-amber-600/90 text-white text-xs font-semibold px-4 py-2 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
          <span>You're offline. Live radio requires an active internet connection.</span>
        </div>
      )}
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = React.useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
