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

    const presenter = await prisma.presenter.findUnique({
      where: { id: params.id },
      include: {
        programmes: true,
        podcasts: true,
      },
    });

    if (!presenter) {
      return NextResponse.json({ error: "Presenter not found" }, { status: 404 });
    }

    return NextResponse.json({ presenter });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch presenter" }, { status: 500 });
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

    if (!hasPermission(session.role, "presenters")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, roleTitle, bio, avatar, socialLinks, isActive, isArchived } = body;

    const existing = await prisma.presenter.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Presenter not found" }, { status: 404 });
    }

    const updated = await prisma.presenter.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(roleTitle && { roleTitle: roleTitle.trim() }),
        ...(bio && { bio: bio.trim() }),
        ...(avatar && { avatar: avatar.trim() }),
        ...(socialLinks !== undefined && {
          socialLinks: typeof socialLinks === "object" ? JSON.stringify(socialLinks) : socialLinks,
        }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(typeof isArchived === "boolean" && { isArchived }),
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_PRESENTER",
      resource: "Presenter",
      details: { presenterId: updated.id, name: updated.name, isActive: updated.isActive },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, presenter: updated });
  } catch (error) {
    console.error("Error updating presenter:", error);
    return NextResponse.json({ error: "Failed to update presenter" }, { status: 500 });
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

    if (!hasPermission(session.role, "presenters")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const existing = await prisma.presenter.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Presenter not found" }, { status: 404 });
    }

    await prisma.presenter.update({
      where: { id: params.id },
      data: { isArchived: true, isActive: false },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ARCHIVE_PRESENTER",
      resource: "Presenter",
      details: { presenterId: existing.id, name: existing.name },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, message: "Presenter archived" });
  } catch (error) {
    console.error("Error archiving presenter:", error);
    return NextResponse.json({ error: "Failed to archive presenter" }, { status: 500 });
  }
}
