import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_STREAM_URL } from "@/lib/constants";
import { getBroadcastSession } from "@/lib/liveAudioBroadcaster";

export const dynamic = "force-dynamic";

export async function GET() {
  const broadcastSession = getBroadcastSession();

  let automatedStreamUrl = DEFAULT_STREAM_URL;
  let isManualLive: boolean | null = null;
  let stationName = "UniCast";
  let fallbackStreamUrl: string | null = null;

  try {
    const setting = await prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    });
    if (setting) {
      if (setting.streamUrl) automatedStreamUrl = setting.streamUrl;
      if (setting.fallbackStreamUrl) fallbackStreamUrl = setting.fallbackStreamUrl;
      if (setting.stationName) stationName = setting.stationName;
      if (typeof setting.isLiveManualOverride === "boolean") {
        isManualLive = setting.isLiveManualOverride;
      }
    }
  } catch {
    // database fallback
  }

  // Check if live presenter is actively on air (either via in-memory broadcast engine or manual override)
  const isLivePresenter = broadcastSession.isBroadcasting || (isManualLive === true);

  // If presenter is live on air, the live broadcast endpoint is /api/stream/live
  const activeStreamUrl = isLivePresenter ? "/api/stream/live" : automatedStreamUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let streamReachable = true;
    if (!isLivePresenter) {
      try {
        const response = await fetch(automatedStreamUrl, {
          method: "GET",
          headers: {
            Range: "bytes=0-100",
            "Icy-MetaData": "1",
            "User-Agent": "UniCastRadioHealthCheck/1.0",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        streamReachable = response.ok || response.status === 206 || response.status === 200;
      } catch {
        streamReachable = false;
      }
    } else {
      clearTimeout(timeoutId);
    }

    const isOnline = isLivePresenter ? true : streamReachable;

    return NextResponse.json({
      isOnline,
      isLivePresenter,
      presenterName: broadcastSession.presenterName || "UniCast Presenter",
      showTitle: broadcastSession.showTitle || "Live Campus Show",
      streamUrl: activeStreamUrl,
      liveStreamUrl: "/api/stream/live",
      automatedStreamUrl,
      fallbackStreamUrl,
      stationName,
      activeSubscribers: broadcastSession.listeners.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      isOnline: isLivePresenter ? true : false,
      isLivePresenter,
      presenterName: broadcastSession.presenterName || "UniCast Presenter",
      showTitle: broadcastSession.showTitle || "Live Campus Show",
      streamUrl: activeStreamUrl,
      liveStreamUrl: "/api/stream/live",
      automatedStreamUrl,
      fallbackStreamUrl,
      stationName,
      timestamp: new Date().toISOString(),
    });
  }
}
