import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentName, course, songTitle, artist, dedication } =
      await req.json();

    if (!studentName || !songTitle || !artist) {
      return NextResponse.json(
        { error: "Student name, song title, and artist are required" },
        { status: 400 }
      );
    }

    const newRequest = await prisma.songRequest.create({
      data: {
        studentName: studentName.trim(),
        course: course ? course.trim() : null,
        songTitle: songTitle.trim(),
        artist: artist.trim(),
        dedication: dedication ? dedication.trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error creating song request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await prisma.songRequest.findMany({
      where: { status: { in: ["APPROVED", "PLAYED"] } },
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}
