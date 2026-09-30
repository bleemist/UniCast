import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_STREAM_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  let streamUrl = DEFAULT_STREAM_URL;
  let isManualLive: boolean | null = null;
  let stationName = "UniCast";
  let fallbackStreamUrl: string | null = null;

  try {
    const setting = await prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    });
    if (setting) {
      if (setting.streamUrl) streamUrl = setting.streamUrl;
      if (setting.fallbackStreamUrl) fallbackStreamUrl = setting.fallbackStreamUrl;
      if (setting.stationName) stationName = setting.stationName;
      if (typeof setting.isLiveManualOverride === "boolean") {
        isManualLive = setting.isLiveManualOverride;
      }
    }
  } catch {
    // database fallback
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(streamUrl, {
      method: "GET",
      headers: {
        Range: "bytes=0-100",
        "Icy-MetaData": "1",
        "User-Agent": "UniCastRadioHealthCheck/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Audio streams return 200 OK or 206 Partial Content
    const streamReachable = response.ok || response.status === 206 || response.status === 200;
    const isOnline = isManualLive !== null ? isManualLive : streamReachable;

    const icyName = response.headers.get("icy-name") || stationName;
    const icyBitrate = response.headers.get("icy-br") || "128";
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    return NextResponse.json({
      isOnline,
      status: response.status,
      streamUrl,
      fallbackStreamUrl,
      stationName,
      bitrate: icyBitrate,
      contentType,
      icyName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // If main stream fails and fallback exists, try fallback
    let fallbackOnline = false;
    if (fallbackStreamUrl) {
      try {
        const fbCtrl = new AbortController();
        const fbTimeout = setTimeout(() => fbCtrl.abort(), 3000);
        const fbRes = await fetch(fallbackStreamUrl, {
          method: "GET",
          headers: { Range: "bytes=0-100" },
          signal: fbCtrl.signal,
        });
        clearTimeout(fbTimeout);
        fallbackOnline = fbRes.ok || fbRes.status === 200 || fbRes.status === 206;
      } catch {
        fallbackOnline = false;
      }
    }

    const finalOnline = isManualLive !== null ? isManualLive : fallbackOnline;

    return NextResponse.json({
      isOnline: finalOnline,
      status: finalOnline ? 200 : 503,
      streamUrl: fallbackOnline && fallbackStreamUrl ? fallbackStreamUrl : streamUrl,
      stationName,
      error: finalOnline ? undefined : "Stream relay offline or unreachable",
      timestamp: new Date().toISOString(),
    });
  }
}
