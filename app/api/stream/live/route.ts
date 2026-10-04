import { NextResponse } from "next/server";
import {
  getBroadcastSession,
  addStreamListener,
  removeStreamListener,
} from "@/lib/liveAudioBroadcaster";
import prisma from "@/lib/prisma";
import { DEFAULT_STREAM_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const broadcastSession = getBroadcastSession();

  // If presenter is broadcasting live, stream the presenter's voice & audio chunks directly
  if (broadcastSession.isBroadcasting) {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const stream = new ReadableStream({
      start(controller) {
        addStreamListener(listenerId, (chunk: Uint8Array) => {
          try {
            controller.enqueue(chunk);
          } catch {
            removeStreamListener(listenerId);
          }
        });

        // Handle client abort / disconnect
        req.signal.addEventListener("abort", () => {
          removeStreamListener(listenerId);
          try {
            controller.close();
          } catch {
            // ignore
          }
        });
      },
      cancel() {
        removeStreamListener(listenerId);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": broadcastSession.mimeType || "audio/webm; codecs=opus",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering in Nginx/proxies
      },
    });
  }

  // Otherwise, redirect or fallback to the automated campus radio stream
  let streamUrl = DEFAULT_STREAM_URL;
  try {
    const setting = await prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    });
    if (setting?.streamUrl) streamUrl = setting.streamUrl;
  } catch {
    // fallback
  }

  return NextResponse.redirect(streamUrl, 307);
}
