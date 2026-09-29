import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT /api/universities/[id] - Admin edit university
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.role, "universities")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, shortName, location, country, isActive } = body;

    const existing = await prisma.university.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 }
      );
    }

    // Check duplicate name if name changed
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.university.findUnique({
        where: { name: name.trim() },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `University '${name.trim()}' already exists` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.university.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(shortName !== undefined && { shortName: shortName?.trim() || null }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(country !== undefined && { country: country?.trim() || "Uganda" }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, university: updated });
  } catch (error) {
    console.error("Failed to update university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update university" },
      { status: 500 }
    );
  }
}

// PATCH /api/universities/[id] - Toggle active status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.role, "universities")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    const updated = await prisma.university.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, university: updated });
  } catch (error) {
    console.error("Failed to toggle university status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle university status" },
      { status: 500 }
    );
  }
}
