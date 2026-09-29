import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_EVENT_TYPES = new Set([
  "LISTEN_STARTED",
  "LISTEN_PAUSED",
  "LISTEN_RESUMED",
  "LISTEN_STOPPED",
  "LISTEN_SESSION_STARTED",
  "LISTEN_SESSION_ENDED",
  "PROGRAMME_VIEWED",
  "PODCAST_PLAYED",
  "NEWS_VIEWED",
  "REQUEST_SUBMITTED",
  "UNIVERSITY_SELECTED",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      anonymousListenerId,
      sessionId,
      universityId,
      eventType,
      programmeId,
      metadata,
    } = body;

    if (!anonymousListenerId || typeof anonymousListenerId !== "string") {
      return NextResponse.json(
        { success: false, error: "anonymousListenerId is required" },
        { status: 400 }
      );
    }

    if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { success: false, error: "Invalid or unsupported eventType" },
        { status: 400 }
      );
    }

    // Verify university exists if universityId provided
    let validUniId: string | null = null;
    if (universityId) {
      const uni = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true },
      });
      if (uni) validUniId = uni.id;
    }

    // Verify programme exists if programmeId provided
    let validProgId: string | null = null;
    if (programmeId) {
      const prog = await prisma.programme.findUnique({
        where: { id: programmeId },
        select: { id: true },
      });
      if (prog) validProgId = prog.id;
    }

    // Verify session exists if sessionId provided
    let validSessionId: string | null = null;
    if (sessionId) {
      const sess = await prisma.listenerSession.findUnique({
        where: { id: sessionId },
        select: { id: true },
      });
      if (sess) validSessionId = sess.id;
    }

    const event = await prisma.listenerEvent.create({
      data: {
        anonymousListenerId,
        sessionId: validSessionId,
        universityId: validUniId,
        programmeId: validProgId,
        eventType,
        metadata: typeof metadata === "string" ? metadata : metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Failed to record analytics event:", error);
    return NextResponse.json(
      { success: false, error: "Internal analytics recording error" },
      { status: 500 }
    );
  }
}
