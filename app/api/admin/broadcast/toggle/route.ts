import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "broadcast")) {
      return NextResponse.json({ error: "Forbidden: Broadcast access required" }, { status: 403 });
    }

    const { isLiveManualOverride, streamUrl } = await req.json();

    const current = await prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    });

    const nextState =
      typeof isLiveManualOverride === "boolean"
        ? isLiveManualOverride
        : !current?.isLiveManualOverride;

    const updated = await prisma.radioSetting.upsert({
      where: { id: "station_settings" },
      update: {
        isLiveManualOverride: nextState,
        ...(streamUrl && { streamUrl }),
      },
      create: {
        id: "station_settings",
        isLiveManualOverride: nextState,
        streamUrl: streamUrl || "https://stream.zeno.fm/f3wvbbqmdg8uv",
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: nextState ? "BROADCAST_GO_ON_AIR" : "BROADCAST_GO_OFF_AIR",
      resource: "RadioSetting",
      details: {
        isLiveManualOverride: nextState,
        presenter: session.name,
        role: session.role,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({
      success: true,
      isLiveManualOverride: updated.isLiveManualOverride,
      streamUrl: updated.streamUrl,
    });
  } catch (error) {
    console.error("Broadcast toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle broadcast state" },
      { status: 500 }
    );
  }
}
