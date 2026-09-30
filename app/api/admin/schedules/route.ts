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

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await prisma.schedule.findMany({
      include: {
        programme: {
          include: {
            category: true,
            presenter: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const programmes = await prisma.programme.findMany({
      where: { isArchived: false },
      select: { id: true, title: true, presenter: { select: { name: true } } },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ schedules, programmes });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to load schedules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const normalizedDay = dayOfWeek?.toUpperCase();
    if (!programmeId || !VALID_DAYS.has(normalizedDay) || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Programme ID, valid day of week, start time, and end time are required." },
        { status: 400 }
      );
    }

    // Validate HH:mm format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Times must be in 24-hour format HH:mm (e.g., 08:00, 14:30)." },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        programmeId,
        dayOfWeek: normalizedDay,
        startTime,
        endTime,
        isLive: isLive !== undefined ? Boolean(isLive) : true,
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
      action: "CREATE_SCHEDULE_SLOT",
      resource: "Schedule",
      details: {
        scheduleId: schedule.id,
        programme: schedule.programme.title,
        day: normalizedDay,
        time: `${startTime}-${endTime}`,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule slot" }, { status: 500 });
  }
}
