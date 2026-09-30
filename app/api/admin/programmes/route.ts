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

    const programmes = await prisma.programme.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        category: true,
        presenter: true,
        schedules: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.programmeCategory.findMany({
      orderBy: { name: "asc" },
    });

    const presenters = await prisma.presenter.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ programmes, categories, presenters });
  } catch (error) {
    console.error("Error fetching admin programmes:", error);
    return NextResponse.json({ error: "Failed to load programmes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "programmes")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, tagline, description, coverImage, categoryId, presenterId, slug } = body;

    if (!title || !tagline || !description || !categoryId || !presenterId) {
      return NextResponse.json(
        { error: "Title, tagline, description, category, and host presenter are required." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const existingSlug = await prisma.programme.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existingSlug ? `${generatedSlug}-${Date.now().toString(36)}` : generatedSlug;

    const programme = await prisma.programme.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        tagline: tagline.trim(),
        description: description.trim(),
        coverImage: coverImage?.trim() || "/images/programmes/default.jpg",
        categoryId,
        presenterId,
        isActive: true,
        isArchived: false,
      },
      include: {
        category: true,
        presenter: true,
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "CREATE_PROGRAMME",
      resource: "Programme",
      details: { programmeId: programme.id, title: programme.title, slug: programme.slug },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, programme });
  } catch (error) {
    console.error("Error creating programme:", error);
    return NextResponse.json({ error: "Failed to create programme" }, { status: 500 });
  }
}
