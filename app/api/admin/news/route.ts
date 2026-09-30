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

    const articles = await prisma.article.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ articles, categories });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "news")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, coverImage, categoryId, isFeatured, isPublished, slug } = body;

    if (!title || !excerpt || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, excerpt, content, and category are required." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const existingSlug = await prisma.article.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existingSlug ? `${generatedSlug}-${Date.now().toString(36)}` : generatedSlug;

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage?.trim() || "/images/news/default.jpg",
        categoryId,
        authorId: session.id,
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        isArchived: false,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "CREATE_ARTICLE",
      resource: "Article",
      details: { articleId: article.id, title: article.title, slug: article.slug },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("Error creating news article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
