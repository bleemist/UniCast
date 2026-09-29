import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const streamUrl =
    process.env.NEXT_PUBLIC_STREAM_URL || "https://stream.zeno.fm/f3wvbbqmdg8uv";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(streamUrl, {
      method: "GET",
      headers: {
        Range: "bytes=0-10",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Audio streams return 200 OK or 206 Partial Content
    const isOnline = response.ok || response.status === 206 || response.status === 200;

    return NextResponse.json({
      isOnline,
      status: response.status,
      streamUrl,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // If the stream server cannot be reached, return false
    return NextResponse.json({
      isOnline: false,
      status: 503,
      streamUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
