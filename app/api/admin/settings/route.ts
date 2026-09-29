import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { streamUrl, isLiveManualOverride, stationName, frequency } =
      await req.json();

    const updated = await prisma.radioSetting.upsert({
      where: { id: "station_settings" },
      update: {
        ...(streamUrl && { streamUrl }),
        ...(typeof isLiveManualOverride === "boolean" && { isLiveManualOverride }),
        ...(stationName && { stationName }),
        ...(frequency && { frequency }),
      },
      create: {
        id: "station_settings",
        streamUrl: streamUrl || "https://stream.zeno.fm/f3wvbbqmdg8uv",
        isLiveManualOverride: isLiveManualOverride || false,
        stationName: stationName || "Kyambogo Radio",
        frequency: frequency || "107.4 FM & Online",
      },
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
