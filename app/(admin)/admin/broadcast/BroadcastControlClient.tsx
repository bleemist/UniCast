"use client";

import * as React from "react";
import Link from "next/link";
import {
  Radio,
  Mic,
  MicOff,
  Upload,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Music,
  Check,
  Power,
  Clock,
  FileAudio,
  Headphones,
  Signal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

interface BroadcastControlClientProps {
  initialSettings: any;
  programmes: any[];
  initialRequests: any[];
  user: any;
}

export function BroadcastControlClient({
  initialSettings,
  programmes,
  initialRequests = [],
  user,
}: BroadcastControlClientProps) {
  // Stream settings
  const [streamUrl, setStreamUrl] = React.useState(
    initialSettings?.streamUrl ||
      process.env.NEXT_PUBLIC_STREAM_URL ||
      "https://stream.zeno.fm/f3wvbbqmdg8uv"
  );
  const [isLiveManualOverride, setIsLiveManualOverride] = React.useState(
    initialSettings?.isLiveManualOverride || false
  );
  const [isChecking, setIsChecking] = React.useState(false);
  const [streamOnline, setStreamOnline] = React.useState(true);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isTogglingLive, setIsTogglingLive] = React.useState(false);

  // Presenter Live Timer & Telemetry
  const [onAirSeconds, setOnAirSeconds] = React.useState(0);
  const [connectedListenersCount, setConnectedListenersCount] = React.useState(0);

  // Web Audio Mixer & Microphone state
  const [micActive, setMicActive] = React.useState(false);
  const [micMuted, setMicMuted] = React.useState(false);
  const [micVolume, setMicVolume] = React.useState(0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const micStreamRef = React.useRef<MediaStream | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const broadcastDestRef = React.useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const peerConnectionsRef = React.useRef<Map<string, RTCPeerConnection>>(new Map());
  const pollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const trackSourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);

  // Audio track playback & requested song upload
  const [uploadedTrack, setUploadedTrack] = React.useState<{
    title: string;
    artist?: string;
    url: string;
    filename?: string;
  } | null>(null);
  const [isPlayingTrack, setIsPlayingTrack] = React.useState(false);
  const [trackProgress, setTrackProgress] = React.useState(0);
  const [trackDuration, setTrackDuration] = React.useState(0);
  const [trackVolume, setTrackVolume] = React.useState(1);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Song requests queue
  const [requests, setRequests] = React.useState<any[]>(initialRequests);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);

  // Timer counter when live
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLiveManualOverride) {
      interval = setInterval(() => {
        setOnAirSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setOnAirSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveManualOverride]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Start live broadcasting: capture mic, mix audio, and start real-time transmission
  const handleStartBroadcasting = async () => {
    setIsTogglingLive(true);
    try {
      // 1. Capture microphone
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = micStream;

      // 2. Initialize Web Audio Context & Master Broadcast Destination Mixer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const broadcastDest = audioCtx.createMediaStreamDestination();
      broadcastDestRef.current = broadcastDest;

      // Connect Mic to Broadcast Destination & Analyser (VU meter)
      const micSource = audioCtx.createMediaStreamSource(micStream);
      micSource.connect(broadcastDest);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      micSource.connect(analyser);

      // Start VU meter animation
      setMicActive(true);
      setMicMuted(false);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Connect Track Player to Mixer so requested songs stream directly to listeners
      if (audioPlayerRef.current) {
        try {
          if (!trackSourceRef.current) {
            trackSourceRef.current = audioCtx.createMediaElementSource(audioPlayerRef.current);
            trackSourceRef.current.connect(audioCtx.destination); // Host hears the song
            trackSourceRef.current.connect(broadcastDest); // Listeners hear the song!
          }
        } catch (e) {
          console.warn("Track mixer connection notice:", e);
        }
      }

      // 3. Notify server to start broadcast and switch all listeners from music to live voice
      const mimeType = MediaRecorder.isTypeSupported("audio/webm; codecs=opus")
        ? "audio/webm; codecs=opus"
        : "audio/ogg; codecs=opus";

      const showName = user?.name ? `${user.name} Live` : "Campus Radio Live Show";
      await fetch(
        `/api/stream/broadcast?action=start&mimeType=${encodeURIComponent(mimeType)}&showTitle=${encodeURIComponent(showName)}`,
        { method: "POST" }
      );

      // 4. Start MediaRecorder for 250ms audio chunk transmission
      const recorder = new MediaRecorder(broadcastDest.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          try {
            const res = await fetch("/api/stream/broadcast", {
              method: "POST",
              headers: { "Content-Type": "application/octet-stream" },
              body: e.data,
            });
            const data = await res.json();
            if (typeof data.activeListeners === "number") {
              setConnectedListenersCount(data.activeListeners);
            }
          } catch {
            // ignore
          }
        }
      };
      recorder.start(250); // 250ms chunks for low-latency live streaming

      // 5. Start WebRTC Broadcaster Polling Loop for direct VoIP phone-call latency
      const pollListenerOffers = async () => {
        try {
          const res = await fetch("/api/stream/webrtc?action=broadcaster_poll_offers", { method: "POST" });
          const data = await res.json();
          if (data.offers && data.offers.length > 0 && broadcastDestRef.current) {
            for (const item of data.offers) {
              const { listenerId, offer } = item;
              const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
              });
              peerConnectionsRef.current.set(listenerId, pc);

              // Add live mixed audio tracks (mic + music)
              broadcastDestRef.current.stream.getTracks().forEach((track) => {
                pc.addTrack(track, broadcastDestRef.current!.stream);
              });

              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  fetch(`/api/stream/webrtc?action=ice_candidate&listenerId=${listenerId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ candidate: event.candidate, role: "broadcaster" }),
                  }).catch(() => {});
                }
              };

              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              await fetch(`/api/stream/webrtc?action=broadcaster_answer&listenerId=${listenerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer }),
              });
            }
          }
        } catch {
          // ignore
        }
      };

      pollTimerRef.current = setInterval(pollListenerOffers, 1000);
      setIsLiveManualOverride(true);
    } catch (err: any) {
      console.error("Broadcast start error:", err);
      alert(err?.message || "Could not access microphone. Please allow microphone permissions in your browser.");
    } finally {
      setIsTogglingLive(false);
    }
  };

  // Stop live broadcasting: stop audio, release mic, and return listeners to automatic music
  const handleStopBroadcasting = async () => {
    setIsTogglingLive(true);
    try {
      // 1. Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // 2. Stop WebRTC polling and peer connections
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();

      // 3. Stop Mic Stream & Web Audio Context
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      broadcastDestRef.current = null;
      trackSourceRef.current = null;
      setMicActive(false);
      setMicVolume(0);

      // 4. Notify server to stop broadcast & return listeners to automatic music
      await fetch("/api/stream/broadcast?action=stop", { method: "POST" });
      setIsLiveManualOverride(false);
      setConnectedListenersCount(0);
    } catch (err) {
      console.error("Broadcast stop error:", err);
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleToggleMicMute = () => {
    if (!micStreamRef.current) return;
    const audioTrack = micStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicMuted(!audioTrack.enabled);
    }
  };

  // Handle uploading audio file for requested songs
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", "audio");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload audio track");
      }

      setUploadedTrack({
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: data.url,
        filename: data.filename,
      });

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = data.url;
        audioPlayerRef.current.load();
      }
    } catch (err: any) {
      // Fallback: load local blob URL so playback still works instantly
      const localUrl = URL.createObjectURL(file);
      setUploadedTrack({
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: localUrl,
      });
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = localUrl;
        audioPlayerRef.current.load();
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Audio track playback controls
  const handleTogglePlayTrack = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingTrack) {
      audioPlayerRef.current.pause();
      setIsPlayingTrack(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingTrack(true);
    }
  };

  // Select a student request to play
  const handleSelectRequestToPlay = (req: any) => {
    setSelectedRequestId(req.id);
    setUploadedTrack({
      title: req.songTitle,
      artist: req.artist,
      url: uploadedTrack?.url || "",
    });
  };

  // Mark song request as played
  const handleMarkRequestPlayed = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PLAYED" }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "PLAYED" } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkStreamNow = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/stream/status");
      const data = await res.json();
      setStreamOnline(data.isOnline);
    } catch {
      setStreamOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveStream = async () => {
    try {
      const res = await fetch("/api/admin/broadcast/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamUrl,
          isLiveManualOverride,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Native audio element for requested track playback */}
      <audio
        ref={audioPlayerRef}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioPlayerRef.current) {
            setTrackProgress(audioPlayerRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioPlayerRef.current) {
            setTrackDuration(audioPlayerRef.current.duration);
          }
        }}
        onEnded={() => setIsPlayingTrack(false)}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-radio-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Live Broadcast Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct audio transmission to campus listeners with requested track player.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/listen" target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Listener Player
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStreamNow}
            isLoading={isChecking}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check Health
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" title="Settings Saved">
          Stream configuration updated successfully.
        </Alert>
      )}

      {/* Master Presenter Action Card */}
      <Card
        className={cn(
          "transition-all duration-300 border-2",
          isLiveManualOverride
            ? "border-live/60 bg-gradient-to-r from-red-950/40 via-navy-900 to-navy-900 shadow-xl shadow-red-950/30"
            : "border-navy-750 bg-navy-850/90"
        )}
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Status & Host Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant={isLiveManualOverride ? "on-air" : "offline"}
                  size="md"
                  className="px-3.5 py-1 text-xs font-bold"
                >
                  {isLiveManualOverride ? "● TRANSMITTING LIVE SOUND TO LISTENERS" : "○ STUDIO OFF AIR / STANDBY"}
                </Badge>
                {isLiveManualOverride && (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-white px-2.5 py-1 rounded bg-navy-950/80 border border-live/40">
                    <Clock className="w-3.5 h-3.5 text-live animate-pulse" />
                    {formatTimer(onAirSeconds)}
                  </span>
                )}
                {isLiveManualOverride && connectedListenersCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">
                    <Signal className="w-3.5 h-3.5 text-cyan-400" />
                    {connectedListenersCount} Tuned In
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Presenter: {user?.name || "Host"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isLiveManualOverride
                    ? "Live voice & music are broadcasting directly to listeners. Students hear your voice in real time."
                    : "Automatic music is currently playing for listeners. Click below to go live and speak."}
                </p>
              </div>
            </div>

            {/* Right: Master Go On Air / Stop Button */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={isLiveManualOverride ? "danger" : "live"}
                size="lg"
                onClick={isLiveManualOverride ? handleStopBroadcasting : handleStartBroadcasting}
                isLoading={isTogglingLive}
                leftIcon={
                  isLiveManualOverride ? (
                    <Power className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5 animate-pulse" />
                  )
                }
                className={cn(
                  "px-8 py-4 text-base font-extrabold tracking-wide uppercase shadow-xl transition-all duration-200",
                  !isLiveManualOverride && "hover:scale-[1.02] glow-live"
                )}
              >
                {isLiveManualOverride ? "Stop Presenting / Go Off Air" : "Go On Air & Start Presenting"}
              </Button>
            </div>
          </div>

          {/* Live Studio Microphone & Transmission Strip */}
          <div className="mt-6 pt-6 border-t border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-950/50 p-4 rounded-xl border border-navy-800">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                  micActive && !micMuted
                    ? "bg-live text-white shadow-md shadow-live/30 animate-pulse"
                    : micActive && micMuted
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-navy-800 text-slate-400 border border-navy-700"
                )}
              >
                {micActive && !micMuted ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Studio Mic Transmission
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-mono font-semibold",
                      micActive && !micMuted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : micActive && micMuted
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-navy-900 text-slate-500 border border-navy-800"
                    )}
                  >
                    {micActive && !micMuted
                      ? "BROADCASTING LIVE VOICE"
                      : micActive && micMuted
                      ? "MIC MUTED"
                      : "MIC OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {micActive
                    ? isLiveManualOverride
                      ? "Live VoIP audio actively transmitting to anyone tuned in."
                      : "Microphone ready."
                    : "Microphone activates automatically when you press 'Go On Air'."}
                </p>
              </div>
            </div>

            {/* VU Meter & Mic Controls */}
            <div className="flex items-center gap-3">
              {micActive && (
                <div className="flex items-center gap-2 bg-navy-900 px-3 py-1.5 rounded-lg border border-navy-800">
                  <span className="text-[10px] font-mono text-slate-400">LEVEL</span>
                  <div className="w-24 h-2.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800 flex">
                    <div
                      className={cn(
                        "h-full transition-all duration-75 rounded-full",
                        micMuted
                          ? "bg-slate-700 w-0"
                          : micVolume > 70
                          ? "bg-red-500"
                          : micVolume > 35
                          ? "bg-emerald-400"
                          : "bg-radio-400"
                      )}
                      style={{ width: micMuted ? "0%" : `${micVolume}%` }}
                    />
                  </div>
                </div>
              )}

              {micActive && (
                <Button
                  variant={micMuted ? "primary" : "secondary"}
                  size="sm"
                  onClick={handleToggleMicMute}
                  leftIcon={micMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                >
                  {micMuted ? "Unmute Mic" : "Mute Mic"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2 Column Layout: Track Player + Live Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requested Song Uploader & Player */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-navy-750 bg-navy-850/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-navy-750 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-radio-400" />
                  Song Request Player & Uploader
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded tracks stream live directly to listeners when you press Play.
                </p>
              </div>

              {/* Upload trigger button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                  leftIcon={<Upload className="w-3.5 h-3.5 text-radio-400" />}
                >
                  Upload Song File
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {uploadError && (
                <Alert variant="error" title="Upload Notice">
                  {uploadError}
                </Alert>
              )}

              {/* Track Info Card */}
              {uploadedTrack ? (
                <div className="p-4 rounded-xl bg-navy-900 border border-navy-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-radio-500/20 border border-radio-500/40 flex items-center justify-center text-radio-400 flex-shrink-0">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white truncate block">
                          {uploadedTrack.title}
                        </span>
                        {uploadedTrack.artist && (
                          <span className="text-xs text-radio-300 font-medium">
                            Artist: {uploadedTrack.artist}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge variant={isPlayingTrack ? "live" : "category"} size="sm">
                      {isPlayingTrack ? "BROADCASTING TRACK" : "QUEUED"}
                    </Badge>
                  </div>

                  {/* Scrub / Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min="0"
                      max={trackDuration || 100}
                      value={trackProgress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTrackProgress(val);
                        if (audioPlayerRef.current) {
                          audioPlayerRef.current.currentTime = val;
                        }
                      }}
                      className="w-full h-1.5 bg-navy-750 rounded-lg appearance-none cursor-pointer accent-radio-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{Math.floor(trackProgress / 60)}:{(Math.floor(trackProgress) % 60).toString().padStart(2, "0")}</span>
                      <span>{Math.floor(trackDuration / 60)}:{(Math.floor(trackDuration) % 60).toString().padStart(2, "0")}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant={isPlayingTrack ? "secondary" : "primary"}
                      size="sm"
                      onClick={handleTogglePlayTrack}
                      leftIcon={
                        isPlayingTrack ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )
                      }
                      className="font-bold px-4"
                    >
                      {isPlayingTrack ? "Pause Track" : "Play to Listeners"}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={trackVolume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setTrackVolume(v);
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.volume = v;
                          }
                        }}
                        className="w-20 h-1 bg-navy-750 rounded accent-radio-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 text-center rounded-xl border border-dashed border-navy-700 bg-navy-900/50 hover:bg-navy-900 transition-colors cursor-pointer space-y-2"
                >
                  <Upload className="w-8 h-8 text-radio-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    Click to Upload a Requested Song File
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports MP3, WAV, AAC, M4A up to 60MB.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stream Mount Settings (Clean & Minimal) */}
          <Card className="border-navy-750 bg-navy-850/80">
            <CardHeader className="pb-3 border-b border-navy-750">
              <CardTitle className="text-sm font-bold text-white">
                Stream Mount Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://stream.zeno.fm/..."
                className="font-mono text-xs"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Icecast / Shoutcast / Zeno endpoint for automated fallback.
                </span>
                <Button variant="primary" size="sm" onClick={handleSaveStream}>
                  Save Endpoint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Student Requests List */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-navy-750 bg-navy-850/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-navy-750 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Incoming Student Requests
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick a song to announce or queue for broadcast.
                </p>
              </div>
              <Link href="/admin/requests" className="text-xs text-radio-400 hover:underline">
                View all
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
              {requests.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No song requests in queue.
                </p>
              ) : (
                requests.map((req) => {
                  const isSelected = selectedRequestId === req.id;
                  return (
                    <div
                      key={req.id}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all space-y-2",
                        isSelected
                          ? "bg-radio-500/10 border-radio-500/50 shadow-sm shadow-radio-500/10"
                          : "bg-navy-900 border-navy-800 hover:border-navy-750"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">
                            {req.songTitle}
                          </span>
                          <span className="text-[11px] text-radio-300 truncate block">
                            by {req.artist}
                          </span>
                        </div>
                        <Badge
                          variant={
                            req.status === "PLAYED"
                              ? "played"
                              : req.status === "APPROVED"
                              ? "approved"
                              : "pending"
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        <span>From: </span>
                        <strong className="text-slate-200">{req.studentName}</strong>
                        {req.university?.shortName && (
                          <span className="text-radio-400 font-mono ml-1 font-bold">
                            ({req.university.shortName})
                          </span>
                        )}
                      </div>

                      {req.dedication && (
                        <p className="text-[11px] text-slate-300 italic bg-navy-950/70 p-2 rounded border border-navy-800 line-clamp-2">
                          "{req.dedication}"
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-navy-800">
                        <button
                          type="button"
                          onClick={() => handleSelectRequestToPlay(req)}
                          className="text-xs font-semibold text-radio-400 hover:text-radio-300 transition-colors flex items-center gap-1"
                        >
                          <Music className="w-3 h-3" />
                          <span>Queue for Air</span>
                        </button>

                        {req.status !== "PLAYED" && (
                          <button
                            type="button"
                            onClick={() => handleMarkRequestPlayed(req.id)}
                            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Played</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
