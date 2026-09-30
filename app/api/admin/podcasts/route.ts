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

    const podcasts = await prisma.podcast.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        category: true,
        presenter: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.podcastCategory.findMany({
      orderBy: { name: "asc" },
    });

    const presenters = await prisma.presenter.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ podcasts, categories, presenters });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    return NextResponse.json({ error: "Failed to load podcasts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "podcasts")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, audioUrl, duration, coverImage, categoryId, presenterId, slug, isPublished } = body;

    if (!title || !description || !audioUrl || !categoryId || !presenterId) {
      return NextResponse.json(
        { error: "Title, description, audio URL, category, and host are required." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const existingSlug = await prisma.podcast.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existingSlug ? `${generatedSlug}-${Date.now().toString(36)}` : generatedSlug;

    const podcast = await prisma.podcast.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        audioUrl: audioUrl.trim(),
        duration: Number(duration) || 0,
        coverImage: coverImage?.trim() || "/images/podcasts/default.jpg",
        categoryId,
        presenterId,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
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
      action: "CREATE_PODCAST",
      resource: "Podcast",
      details: { podcastId: podcast.id, title: podcast.title, slug: podcast.slug },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, podcast });
  } catch (error) {
    console.error("Error creating podcast:", error);
    return NextResponse.json({ error: "Failed to create podcast" }, { status: 500 });
  }
}
