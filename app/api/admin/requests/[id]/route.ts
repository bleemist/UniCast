import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "requests")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, adminNote } = await req.json();

    const existing = await prisma.songRequest.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await prisma.songRequest.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_REQUEST_STATUS",
      resource: "SongRequest",
      details: { requestId: params.id, oldStatus: existing.status, newStatus: status, song: existing.songTitle },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
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

    if (!hasPermission(session.role, "requests")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.songRequest.findUnique({
      where: { id: params.id },
    });

    if (existing) {
      await prisma.songRequest.delete({
        where: { id: params.id },
      });

      await createAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "DELETE_REQUEST",
        resource: "SongRequest",
        details: { requestId: params.id, song: existing.songTitle, artist: existing.artist },
        ipAddress: getClientIp(req),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
