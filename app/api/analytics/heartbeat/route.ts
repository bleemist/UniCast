import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      anonymousListenerId,
      universityId,
      programmeId,
      durationIncrement = 30,
      deviceType,
      browser,
    } = body;

    if (!anonymousListenerId || typeof anonymousListenerId !== "string") {
      return NextResponse.json(
        { success: false, error: "anonymousListenerId is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const validIncrement = Math.min(Math.max(Number(durationIncrement) || 30, 5), 120);

    // Verify university exists
    let validUniId: string | null = null;
    if (universityId) {
      const uni = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true },
      });
      if (uni) validUniId = uni.id;
    }

    // Try finding existing active session
    let existingSession = null;
    if (sessionId) {
      existingSession = await prisma.listenerSession.findUnique({
        where: { id: sessionId },
      });
    }

    // A session is considered continuous if last seen within 10 minutes (600,000 ms)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const isContinuous =
      existingSession &&
      now.getTime() - existingSession.lastSeenAt.getTime() < TEN_MINUTES_MS;

    if (existingSession && isContinuous) {
      const updatedSession = await prisma.listenerSession.update({
        where: { id: existingSession.id },
        data: {
          lastSeenAt: now,
          sessionDuration: existingSession.sessionDuration + validIncrement,
          ...(validUniId && !existingSession.universityId ? { universityId: validUniId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: updatedSession.id,
      });
    }

    // Otherwise, create a new listening session
    const newSession = await prisma.listenerSession.create({
      data: {
        anonymousListenerId,
        universityId: validUniId,
        sessionStartedAt: now,
        lastSeenAt: now,
        sessionDuration: validIncrement,
        deviceType: deviceType || "desktop",
        browser: browser || "Other",
      },
    });

    // Record session started event
    await prisma.listenerEvent.create({
      data: {
        anonymousListenerId,
        sessionId: newSession.id,
        universityId: validUniId,
        programmeId: programmeId || null,
        eventType: "LISTEN_SESSION_STARTED",
        timestamp: now,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
    });
  } catch (error) {
    console.error("Heartbeat telemetry error:", error);
    return NextResponse.json(
      { success: false, error: "Heartbeat failed" },
      { status: 500 }
    );
  }
}
