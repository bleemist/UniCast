import { NextResponse } from "next/server";
import { getServerSession, hasPermission } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  startBroadcast,
  stopBroadcast,
  pushAudioChunk,
  getBroadcastSession,
} from "@/lib/liveAudioBroadcaster";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "broadcast")) {
      return NextResponse.json({ error: "Forbidden: Broadcast access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Action: Start broadcast
    if (action === "start") {
      const mimeType = searchParams.get("mimeType") || "audio/webm; codecs=opus";
      const showTitle = searchParams.get("showTitle") || "Live Campus Show";
      
      startBroadcast(session.id, session.name, showTitle, mimeType);

      // Sync database live override
      try {
        await prisma.radioSetting.upsert({
          where: { id: "station_settings" },
          update: { isLiveManualOverride: true },
          create: { id: "station_settings", isLiveManualOverride: true },
        });
      } catch (dbErr) {
        console.warn("Could not sync isLiveManualOverride to db:", dbErr);
      }

      return NextResponse.json({
        success: true,
        status: "broadcasting",
        presenter: session.name,
        showTitle,
      });
    }

    // Action: Stop broadcast
    if (action === "stop") {
      stopBroadcast();

      // Sync database live override to off
      try {
        await prisma.radioSetting.upsert({
          where: { id: "station_settings" },
          update: { isLiveManualOverride: false },
          create: { id: "station_settings", isLiveManualOverride: false },
        });
      } catch (dbErr) {
        console.warn("Could not sync isLiveManualOverride to db:", dbErr);
      }

      return NextResponse.json({
        success: true,
        status: "stopped",
      });
    }

    // Action: Ingest live audio binary chunk
    const broadcastSession = getBroadcastSession();
    if (!broadcastSession.isBroadcasting) {
      // Auto-start if not started
      startBroadcast(session.id, session.name);
    }

    const arrayBuffer = await req.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      const uint8 = new Uint8Array(arrayBuffer);
      pushAudioChunk(uint8);
    }

    return NextResponse.json({
      success: true,
      receivedBytes: arrayBuffer.byteLength,
      activeListeners: broadcastSession.listeners.size,
    });
  } catch (error) {
    console.error("Broadcast ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to process broadcast chunk" },
      { status: 500 }
    );
  }
}
