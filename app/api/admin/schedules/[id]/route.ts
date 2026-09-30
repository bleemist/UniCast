import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

const VALID_DAYS = new Set([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "schedules")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { programmeId, dayOfWeek, startTime, endTime, isLive } = body;

    const existing = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: { programme: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Schedule slot not found" }, { status: 404 });
    }

    const normalizedDay = dayOfWeek ? dayOfWeek.toUpperCase() : undefined;
    if (normalizedDay && !VALID_DAYS.has(normalizedDay)) {
      return NextResponse.json({ error: "Invalid day of week" }, { status: 400 });
    }

    const updated = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        ...(programmeId && { programmeId }),
        ...(normalizedDay && { dayOfWeek: normalizedDay }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(typeof isLive === "boolean" && { isLive }),
      },
      include: {
        programme: {
          include: { presenter: true, category: true },
        },
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_SCHEDULE_SLOT",
      resource: "Schedule",
      details: {
        scheduleId: updated.id,
        programme: updated.programme.title,
        day: updated.dayOfWeek,
        time: `${updated.startTime}-${updated.endTime}`,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule slot" }, { status: 500 });
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

    if (!hasPermission(session.role, "schedules")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const existing = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: { programme: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Schedule slot not found" }, { status: 404 });
    }

    await prisma.schedule.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "DELETE_SCHEDULE_SLOT",
      resource: "Schedule",
      details: {
        scheduleId: params.id,
        programme: existing.programme.title,
        day: existing.dayOfWeek,
        time: `${existing.startTime}-${existing.endTime}`,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, message: "Schedule slot deleted" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Failed to delete schedule slot" }, { status: 500 });
  }
}
