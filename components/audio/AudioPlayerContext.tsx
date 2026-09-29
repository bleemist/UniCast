"use client";

import * as React from "react";
import {
  AudioPlayerContextType,
  AudioPlaybackState,
  TrackMetadata,
} from "@/types";

const defaultStreamUrl =
  process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv";

const defaultStationName =
  process.env.NEXT_PUBLIC_STATION_NAME || "Kyambogo Radio";

const AudioPlayerContext = React.createContext<AudioPlayerContextType | null>(
  null
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [state, setState] = React.useState<AudioPlaybackState>("idle");
  const [volume, setVolumeState] = React.useState<number>(0.8);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [streamOnline, setStreamOnline] = React.useState<boolean>(true);
  const [currentTrack, setCurrentTrack] = React.useState<TrackMetadata | null>({
    title: defaultStationName,
    subtitle: "107.4 FM & Online • Live Stream",
    isLive: true,
    audioUrl: defaultStreamUrl,
    artwork: "/images/radio-logo.png",
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
      return false;
    } catch {
      // In case api route is still starting or unreachable
      return true;
    }
  }, []);

  // Update MediaSession API for mobile lock screens
  const updateMediaSession = React.useCallback(
    (track: TrackMetadata) => {
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.subtitle,
          album: defaultStationName,
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

    const handleWaiting = () => setState("loading");
    const handleCanPlay = () => {
      if (state === "loading") setState("playing");
    };
    const handlePlaying = () => setState("playing");
    const handlePause = () => setState("paused");
    const handleError = () => {
      setState("error");
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Initial stream health check
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 30000);

    return () => {
      clearInterval(interval);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [checkStreamStatus]);

  const playLiveStream = React.useCallback(() => {
    const liveTrack: TrackMetadata = {
      title: "Kyambogo Radio 107.4 FM",
      subtitle: "The Voice of Kyambogo University",
      isLive: true,
      audioUrl: defaultStreamUrl,
      artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&q=80",
    };

    setCurrentTrack(liveTrack);
    updateMediaSession(liveTrack);

    if (audioRef.current) {
      setState("loading");
      // Append cache buster to force fresh live stream chunk
      const streamSrc = `${defaultStreamUrl}${defaultStreamUrl.includes("?") ? "&" : "?"}nocache=${Date.now()}`;
      audioRef.current.src = streamSrc;
      audioRef.current
        .play()
        .then(() => setState("playing"))
        .catch(() => setState("error"));
    }
  }, [updateMediaSession]);

  const playTrack = React.useCallback(
    (track: TrackMetadata) => {
      setCurrentTrack(track);
      updateMediaSession(track);

      if (audioRef.current) {
        setState("loading");
        audioRef.current.src = track.audioUrl;
        audioRef.current
          .play()
          .then(() => setState("playing"))
          .catch(() => setState("error"));
      }
    },
    [updateMediaSession]
  );

  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // If it was a live stream, reset source to prevent buffer memory buildup
      if (currentTrack?.isLive) {
        audioRef.current.src = "";
      }
      setState("paused");
    }
  }, [currentTrack]);

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
    isLoading: state === "loading",
    isLiveStream: !!currentTrack?.isLive,
    currentTrack,
    volume,
    isMuted,
    streamOnline,
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
