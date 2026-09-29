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

const AudioPlayerContext = React.createContext<AudioPlayerContextType | null>(
  null
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const heartbeatTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = React.useState<AudioPlaybackState>("idle");
  const [volume, setVolumeState] = React.useState<number>(0.85);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [streamOnline, setStreamOnline] = React.useState<boolean>(true);
  const [currentProgrammeTitle, setCurrentProgrammeTitle] = React.useState<string>("Morning Campus Pulse");
  const [currentTrack, setCurrentTrack] = React.useState<TrackMetadata | null>({
    title: STATION_NAME,
    subtitle: STATION_TAGLINE,
    isLive: true,
    audioUrl: DEFAULT_STREAM_URL,
    artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
  });

  // Check stream status
  const checkStreamStatus = React.useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/stream/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStreamOnline(data.isOnline);
        return data.isOnline;
      }
      return true;
    } catch {
      return true;
    }
  }, []);

  // Stop heartbeat timer
  const stopHeartbeat = React.useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  // Start heartbeat timer (pings every 30 seconds while playing)
  const startHeartbeat = React.useCallback(() => {
    stopHeartbeat();
    // Immediate initial heartbeat ping
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

  // Initialize Audio Element
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => setState("buffering");
    const handleCanPlay = () => {
      if (state === "loading" || state === "buffering") setState("playing");
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
      setState("error");
      stopHeartbeat();
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Initial stream health check
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 45000);

    return () => {
      clearInterval(interval);
      stopHeartbeat();
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [checkStreamStatus, startHeartbeat, stopHeartbeat]);

  const playLiveStream = React.useCallback(() => {
    const liveTrack: TrackMetadata = {
      title: `${STATION_NAME} • Live Broadcast`,
      subtitle: STATION_TAGLINE,
      isLive: true,
      audioUrl: DEFAULT_STREAM_URL,
      artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
    };

    setCurrentTrack(liveTrack);
    updateMediaSession(liveTrack);

    if (audioRef.current) {
      setState("loading");
      // Cache buster for live stream mount point
      const streamSrc = `${DEFAULT_STREAM_URL}${DEFAULT_STREAM_URL.includes("?") ? "&" : "?"}ts=${Date.now()}`;
      audioRef.current.src = streamSrc;
      audioRef.current
        .play()
        .then(() => {
          setState("playing");
          recordListenerEvent("LISTEN_STARTED", undefined, { isLive: true });
          startHeartbeat();
        })
        .catch((e) => {
          console.warn("Audio play blocked or offline:", e);
          setState("error");
        });
    }
  }, [startHeartbeat, updateMediaSession]);

  const playTrack = React.useCallback(
    (track: TrackMetadata) => {
      setCurrentTrack(track);
      updateMediaSession(track);

      if (audioRef.current) {
        setState("loading");
        audioRef.current.src = track.audioUrl;
        audioRef.current
          .play()
          .then(() => {
            setState("playing");
            recordListenerEvent(track.isLive ? "LISTEN_STARTED" : "PODCAST_PLAYED", undefined, {
              title: track.title,
            });
            startHeartbeat();
          })
          .catch(() => setState("error"));
      }
    },
    [startHeartbeat, updateMediaSession]
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

  const value: AudioPlayerContextType = {
    state,
    isPlaying: state === "playing",
    isLoading: state === "loading" || state === "buffering",
    isLiveStream: !!currentTrack?.isLive,
    currentTrack,
    volume,
    isMuted,
    streamOnline,
    currentProgrammeTitle,
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
