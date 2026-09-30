import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("archived") === "true";

    const presenters = await prisma.presenter.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        programmes: {
          select: { id: true, title: true },
        },
        podcasts: {
          select: { id: true, title: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ presenters });
  } catch (error) {
    console.error("Error fetching presenters:", error);
    return NextResponse.json({ error: "Failed to load presenters" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "presenters")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, roleTitle, bio, avatar, socialLinks, slug } = body;

    if (!name || !roleTitle || !bio) {
      return NextResponse.json(
        { error: "Name, role title, and biography are required." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const existingSlug = await prisma.presenter.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existingSlug ? `${generatedSlug}-${Date.now().toString(36)}` : generatedSlug;

    const presenter = await prisma.presenter.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        roleTitle: roleTitle.trim(),
        bio: bio.trim(),
        avatar: avatar?.trim() || "/images/presenters/default.jpg",
        socialLinks: typeof socialLinks === "object" ? JSON.stringify(socialLinks) : socialLinks || null,
        isActive: true,
        isArchived: false,
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "CREATE_PRESENTER",
      resource: "Presenter",
      details: { presenterId: presenter.id, name: presenter.name, slug: presenter.slug },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, presenter });
  } catch (error) {
    console.error("Error creating presenter:", error);
    return NextResponse.json({ error: "Failed to create presenter" }, { status: 500 });
  }
}
