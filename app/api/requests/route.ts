import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 requests per 5 minutes per IP
    const limiter = rateLimit(`song_request_${ip}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 5,
    });

    if (!limiter.isAllowed) {
      return NextResponse.json(
        {
          error: "Too many song requests. Please wait a few minutes before submitting another request.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { studentName, universityId, universityName, songTitle, artist, dedication, course } = body;

    if (!songTitle || !songTitle.trim() || !artist || !artist.trim()) {
      return NextResponse.json(
        { error: "Song title and artist name are required." },
        { status: 400 }
      );
    }

    // Enforce reasonable length limits
    const sanitizedTitle = songTitle.trim().slice(0, 150);
    const sanitizedArtist = artist.trim().slice(0, 150);
    const sanitizedName = (studentName?.trim() || "Anonymous Listener").slice(0, 100);
    const sanitizedCourse = course?.trim() ? course.trim().slice(0, 100) : null;
    const sanitizedDedication = dedication?.trim() ? dedication.trim().slice(0, 500) : null;
    const sanitizedUniName = universityName?.trim() ? universityName.trim().slice(0, 150) : null;

    // Verify universityId exists if provided
    let validUniId: string | null = null;
    if (universityId) {
      const uni = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true },
      });
      if (uni) {
        validUniId = uni.id;
      }
    }

    const newRequest = await prisma.songRequest.create({
      data: {
        studentName: sanitizedName,
        course: sanitizedCourse,
        universityId: validUniId,
        universityName: sanitizedUniName,
        songTitle: sanitizedTitle,
        artist: sanitizedArtist,
        dedication: sanitizedDedication,
        status: "PENDING",
        ipAddress: ip,
      },
    });

    // Optionally record listener event for analytics
    try {
      await prisma.listenerEvent.create({
        data: {
          anonymousListenerId: body.anonymousListenerId || `anon_${ip.replace(/[^a-zA-Z0-9]/g, "_")}`,
          universityId: validUniId,
          eventType: "REQUEST_SUBMITTED",
          metadata: JSON.stringify({
            requestId: newRequest.id,
            songTitle: sanitizedTitle,
            artist: sanitizedArtist,
          }),
        },
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error creating song request:", error);
    return NextResponse.json(
      { error: "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = { in: ["APPROVED", "PLAYED"] };
    }

    const requests = await prisma.songRequest.findMany({
      where: whereClause,
      include: {
        university: {
          select: { name: true, shortName: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}
