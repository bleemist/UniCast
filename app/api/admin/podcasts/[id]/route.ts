import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        presenter: true,
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    return NextResponse.json({ podcast });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch podcast" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "podcasts")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, audioUrl, duration, coverImage, categoryId, presenterId, isPublished, isArchived } = body;

    const existing = await prisma.podcast.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    const updated = await prisma.podcast.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(audioUrl && { audioUrl: audioUrl.trim() }),
        ...(duration !== undefined && { duration: Number(duration) || 0 }),
        ...(coverImage && { coverImage: coverImage.trim() }),
        ...(categoryId && { categoryId }),
        ...(presenterId && { presenterId }),
        ...(typeof isPublished === "boolean" && { isPublished }),
        ...(typeof isArchived === "boolean" && { isArchived }),
      },
      include: {
        category: true,
        presenter: true,
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_PODCAST",
      resource: "Podcast",
      details: { podcastId: updated.id, title: updated.title, isPublished: updated.isPublished },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, podcast: updated });
  } catch (error) {
    console.error("Error updating podcast:", error);
    return NextResponse.json({ error: "Failed to update podcast" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "podcasts")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const existing = await prisma.podcast.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    await prisma.podcast.update({
      where: { id: params.id },
      data: { isArchived: true, isPublished: false },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ARCHIVE_PODCAST",
      resource: "Podcast",
      details: { podcastId: existing.id, title: existing.title },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, message: "Podcast archived" });
  } catch (error) {
    console.error("Error archiving podcast:", error);
    return NextResponse.json({ error: "Failed to archive podcast" }, { status: 500 });
  }
}
