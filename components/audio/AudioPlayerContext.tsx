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
  const rtcPeerRef = React.useRef<RTCPeerConnection | null>(null);
  const rtcAudioRef = React.useRef<HTMLAudioElement | null>(null);

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
        if (data.automatedStreamUrl) {
          setAutomatedStreamUrl(data.automatedStreamUrl);
        }

        const targetStream = liveNow
          ? "/api/stream/live"
          : data.automatedStreamUrl || data.streamUrl || DEFAULT_STREAM_URL;

        setActiveStreamUrl(targetStream);

        // Auto-switch audio if currently playing live radio and presenter state changed
        if (audioRef.current && (state === "playing" || state === "loading" || state === "buffering")) {
          if (prevLivePresenterRef.current !== liveNow) {
            console.log(`🔄 [UniCast Live Stream] Switching from ${prevLivePresenterRef.current ? "Presenter" : "Automatic Music"} to ${liveNow ? "Presenter Live Broadcast" : "Automatic Campus Music"}`);
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
            audioRef.current
              .play()
              .then(() => setState("playing"))
              .catch(() => {});
          }
        } else {
          prevLivePresenterRef.current = liveNow;
        }

        return data.isOnline;
      }
      return true;
    } catch {
      return true;
    }
  }, [state]);

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

    // Secondary audio element for WebRTC VoIP stream
    const rtcAudio = new Audio();
    rtcAudio.autoplay = true;
    rtcAudio.volume = volume;
    rtcAudioRef.current = rtcAudio;

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

    // Network offline/online listeners
    const handleOnline = () => {
      setIsNetworkOffline(false);
      checkStreamStatus();
    };
    const handleOffline = () => {
      setIsNetworkOffline(true);
      if (state === "playing") {
        audio.pause();
        setState("offline");
        stopHeartbeat();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial stream health check + frequent 4-second polling to immediately catch presenter going on air!
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 4000);

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
      if (rtcPeerRef.current) {
        rtcPeerRef.current.close();
        rtcPeerRef.current = null;
      }
    };
  }, [checkStreamStatus, startHeartbeat, stopHeartbeat]);

  // Connect WebRTC VoIP listener for zero-latency direct audio
  const connectWebRTCListener = React.useCallback(async () => {
    if (typeof window === "undefined" || !window.RTCPeerConnection) return;
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      rtcPeerRef.current = pc;

      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && rtcAudioRef.current) {
          rtcAudioRef.current.srcObject = event.streams[0];
          rtcAudioRef.current.play().catch(() => {});
          // If WebRTC is receiving live presenter voice directly, mute the chunked audio to avoid echo
          if (audioRef.current) {
            audioRef.current.muted = true;
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const listenerId = `webrtc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const res = await fetch(`/api/stream/webrtc?action=listener_offer&listenerId=${listenerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer }),
      });

      if (!res.ok) return;

      // Poll for broadcaster answer
      let attempts = 0;
      const pollAnswer = async () => {
        if (attempts > 8 || !rtcPeerRef.current) return;
        attempts++;
        try {
          const ansRes = await fetch(`/api/stream/webrtc?action=listener_poll_answer&listenerId=${listenerId}`, {
            method: "POST",
          });
          const ansData = await ansRes.json();
          if (ansData.answer && pc.signalingState !== "closed") {
            await pc.setRemoteDescription(new RTCSessionDescription(ansData.answer));
          } else {
            setTimeout(pollAnswer, 500);
          }
        } catch {
          // fallback
        }
      };
      setTimeout(pollAnswer, 500);
    } catch {
      // Fallback: normal /api/stream/live plays
    }
  }, []);

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
        targetStream = livePresenterNow
          ? "/api/stream/live"
          : data.automatedStreamUrl || data.streamUrl || DEFAULT_STREAM_URL;
        setActiveStreamUrl(targetStream);
      }
    } catch {
      // keep current values
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
      audioRef.current
        .play()
        .then(() => {
          setState("playing");
          recordListenerEvent("LISTEN_STARTED", undefined, { isLive: true, livePresenterNow });
          startHeartbeat();

          // If presenter is live, also attempt direct WebRTC VoIP connection for instant zero-latency audio
          if (livePresenterNow) {
            connectWebRTCListener();
          }
        })
        .catch((e) => {
          console.warn("Audio play blocked or stream offline:", e);
          setState("error");
        });
    }
  }, [activeStreamUrl, connectWebRTCListener, isLivePresenter, isMuted, presenterName, startHeartbeat, updateMediaSession]);

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
    if (rtcAudioRef.current) {
      rtcAudioRef.current.pause();
      rtcAudioRef.current.srcObject = null;
    }
    if (rtcPeerRef.current) {
      rtcPeerRef.current.close();
      rtcPeerRef.current = null;
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
    if (rtcAudioRef.current) {
      rtcAudioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
      if (rtcAudioRef.current) rtcAudioRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleMute = React.useCallback(() => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioRef.current.muted = newMute;
    if (rtcAudioRef.current) {
      rtcAudioRef.current.muted = newMute;
    }
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
