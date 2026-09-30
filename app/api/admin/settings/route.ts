import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET() {
  try {
    const settings = await prisma.radioSetting.findUnique({
      where: { id: "station_settings" },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "settings")) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const {
      streamUrl,
      fallbackStreamUrl,
      isLiveManualOverride,
      stationName,
      tagline,
      frequency,
      contactEmail,
      contactPhone,
      socialLinks,
    } = await req.json();

    const updated = await prisma.radioSetting.upsert({
      where: { id: "station_settings" },
      update: {
        ...(streamUrl !== undefined && { streamUrl }),
        ...(fallbackStreamUrl !== undefined && { fallbackStreamUrl }),
        ...(typeof isLiveManualOverride === "boolean" && { isLiveManualOverride }),
        ...(stationName !== undefined && { stationName }),
        ...(tagline !== undefined && { tagline }),
        ...(frequency !== undefined && { frequency }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(socialLinks !== undefined && { socialLinks }),
      },
      create: {
        id: "station_settings",
        streamUrl: streamUrl || "https://stream.zeno.fm/f3wvbbqmdg8uv",
        fallbackStreamUrl: fallbackStreamUrl || null,
        isLiveManualOverride: isLiveManualOverride || false,
        stationName: stationName || "UniCast",
        tagline: tagline || "Your Campus Pulse",
        frequency: frequency || "Online Radio Network",
        contactEmail: contactEmail || "contact@unicast.radio",
        contactPhone: contactPhone || "+256 700 000000",
        socialLinks: socialLinks || null,
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_RADIO_SETTINGS",
      resource: "RadioSetting",
      details: { stationName: updated.stationName, streamUrl: updated.streamUrl },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error updating radio settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
