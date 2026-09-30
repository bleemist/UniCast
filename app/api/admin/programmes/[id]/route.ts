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

    const programme = await prisma.programme.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        presenter: true,
        schedules: true,
      },
    });

    if (!programme) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    return NextResponse.json({ programme });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch programme" }, { status: 500 });
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

    if (!hasPermission(session.role, "programmes")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, tagline, description, coverImage, categoryId, presenterId, isActive, isArchived } = body;

    const existing = await prisma.programme.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    const updated = await prisma.programme.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(tagline && { tagline: tagline.trim() }),
        ...(description && { description: description.trim() }),
        ...(coverImage && { coverImage: coverImage.trim() }),
        ...(categoryId && { categoryId }),
        ...(presenterId && { presenterId }),
        ...(typeof isActive === "boolean" && { isActive }),
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
      action: "UPDATE_PROGRAMME",
      resource: "Programme",
      details: { programmeId: updated.id, title: updated.title, isActive: updated.isActive, isArchived: updated.isArchived },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, programme: updated });
  } catch (error) {
    console.error("Error updating programme:", error);
    return NextResponse.json({ error: "Failed to update programme" }, { status: 500 });
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

    if (!hasPermission(session.role, "programmes")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const existing = await prisma.programme.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Programme not found" }, { status: 404 });
    }

    // Soft delete by archiving to preserve relational integrity with schedules and listener events
    const archived = await prisma.programme.update({
      where: { id: params.id },
      data: { isArchived: true, isActive: false },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ARCHIVE_PROGRAMME",
      resource: "Programme",
      details: { programmeId: existing.id, title: existing.title },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, message: "Programme archived" });
  } catch (error) {
    console.error("Error deleting programme:", error);
    return NextResponse.json({ error: "Failed to archive programme" }, { status: 500 });
  }
}
