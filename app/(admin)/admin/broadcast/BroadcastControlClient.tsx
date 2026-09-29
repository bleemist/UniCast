"use client";

import * as React from "react";
import {
  Radio,
  Laptop,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Mic,
  Sliders,
  AlertTriangle,
  Play,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

interface BroadcastControlClientProps {
  initialSettings: any;
  programmes: any[];
}

export function BroadcastControlClient({
  initialSettings,
  programmes,
}: BroadcastControlClientProps) {
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
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamUrl,
          isLiveManualOverride,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Live Studio Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Broadcast Control Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor the audio streaming pipeline, configure Icecast mounts, and manage on-air broadcast status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={checkStreamNow}
            isLoading={isChecking}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Check Stream Health
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" title="Settings Saved">
          Broadcast stream configuration updated successfully.
        </Alert>
      )}

      {/* Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Stream Health & Status */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-navy-800 bg-navy-850/80">
            <CardHeader className="pb-4 border-b border-navy-750">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">
                  Transmission Status
                </CardTitle>
                <Badge variant={streamOnline ? "live" : "offline"} size="md">
                  {streamOnline ? "● ON AIR TRANSMITTING" : "○ STUDIO OFFLINE"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Real-time check against the stream server mount point.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Stream Mount Point:
                  </span>
                  <span className="text-xs font-mono text-radio-400">
                    MP3 / AAC Live
                  </span>
                </div>
                <Input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://your-icecast-server.com:8000/live"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your Icecast / Shoutcast / Zeno.fm stream URL. The web player
                  connects directly to this endpoint.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">
                    Force "ON AIR" Status
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Manually show "ON AIR" badge on the website even if ping tests timeout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isLiveManualOverride}
                  onChange={(e) => setIsLiveManualOverride(e.target.checked)}
                  className="w-5 h-5 accent-radio-500 rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-navy-750 flex justify-end">
                <Button variant="primary" size="md" onClick={handleSaveStream}>
                  Update Broadcast Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Laptop Broadcasting Software Connection Guide */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-navy-700/80 bg-navy-850/90 shadow-xl">
            <CardHeader className="pb-3 border-b border-navy-750">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-radio-400" />
                <CardTitle className="text-sm font-semibold text-white">
                  Broadcasting from Your Laptop (Zero Budget)
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                How your laptop microphone and music reach the streaming server.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-radio-500/20 text-radio-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <strong className="text-white block">Download BUTT (Free & Open Source)</strong>
                    <p className="text-slate-400 mt-0.5">
                      Install <strong>BUTT (Broadcast Using This Tool)</strong> on your Windows laptop. It uses under 15MB RAM and works with any USB mic.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-radio-500/20 text-radio-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <strong className="text-white block">Configure Server Details</strong>
                    <p className="text-slate-400 mt-0.5">
                      Open BUTT → Settings → Server. Add your Icecast host, port (e.g. 8000), mount point (e.g. <code>/live</code>), and source password.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-radio-500/20 text-radio-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <strong className="text-white block">Select Audio Devices</strong>
                    <p className="text-slate-400 mt-0.5">
                      Under Audio Settings in BUTT, select your Laptop Microphone or Stereo Mix (to stream microphone + Spotify/DJ music simultaneously).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-radio-500/20 text-radio-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    4
                  </span>
                  <div>
                    <strong className="text-white block">Press [Play / Connect]</strong>
                    <p className="text-slate-400 mt-0.5">
                      Click the Play button on BUTT. You are now broadcasting live! All students on the website will hear your voice in real time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Budget Confirmation: UGX 0
                </span>
                <p className="text-[11px] text-slate-400">
                  This architecture requires zero paid services. Your laptop acts as the studio console and encoder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
